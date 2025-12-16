import { QdrantClient } from '@qdrant/js-client-rest';
import cosineSimilarity from 'cosine-similarity';

// Initialize Qdrant Client (Mock or Real based on env)
const qdrant = new QdrantClient({
    url: process.env.QDRANT_URL || 'http://localhost:6333',
    apiKey: process.env.QDRANT_API_KEY,
});

interface AnalysisResult {
    score: number;
    missingKeywords: string[];
    matchedKeywords: string[];
    keywordGapVector?: number[]; // For debugging
}

// Simple stopword list for keyword extraction
const STOP_WORDS = new Set([
    'a', 'an', 'the', 'and', 'or', 'but', 'is', 'are', 'was', 'were',
    'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from',
    'i', 'you', 'he', 'she', 'it', 'we', 'they',
    'that', 'this', 'these', 'those',
    'be', 'have', 'do', 'will', 'can', 'should',
    'not', 'so', 'as', 'if', 'then'
]);

// Helper to clean and tokenize text
function extractKeywords(text: string): string[] {
    return text
        .toLowerCase()
        .replace(/[^\w\s]/g, '') // Remove punctuation
        .split(/\s+/)
        .filter(word => word.length > 2 && !STOP_WORDS.has(word));
}

// Mock Embedding Function (Replace with actual LLM embedding in production)
async function generateEmbedding(text: string): Promise<number[]> {
    // In a real scenario, call OpenAI/Gemini/Local embedding API
    // For this prototype, we'll create a sparse keyword vector or mock it
    // Let's mock a 384-dimension vector (common for small models)
    
    // Deterministic mock based on text hash for consistency in tests
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
        hash = ((hash << 5) - hash) + text.charCodeAt(i);
        hash |= 0;
    }
    
    const vector = new Array(384).fill(0).map((_, i) => {
        return Math.sin(hash + i) * 0.5 + 0.5; // Normalized 0-1ish
    });
    
    return vector;
}

export async function analyzeResume(resumeText: string, jobDescription: string): Promise<AnalysisResult> {
    // 1. Keyword Analysis (Traditional ATS)
    const resumeKeywords = new Set(extractKeywords(resumeText));
    const jobKeywords = new Set(extractKeywords(jobDescription));
    
    const matchedKeywords = [...jobKeywords].filter(k => resumeKeywords.has(k));
    const missingKeywords = [...jobKeywords].filter(k => !resumeKeywords.has(k));
    
    // Keyword score: weighted by importance (simple count here)
    const keywordScore = (matchedKeywords.length / Math.max(jobKeywords.size, 1)) * 100;

    // 2. Vector Similarity (Semantic Match)
    let semanticScore = 0;
    try {
        const resumeVector = await generateEmbedding(resumeText);
        const jobVector = await generateEmbedding(jobDescription);
        
        // Cosine similarity ranges -1 to 1. We map -1..1 to 0..100 roughly
        const similarity = cosineSimilarity(resumeVector, jobVector); 
        // Normalize: typically good matches are > 0.7. Let's scale 0.5-1.0 to 0-100
        semanticScore = Math.max(0, (similarity - 0.5) * 200); 
    } catch (e) {
        console.error("Vector embedding failed, falling back to keyword score", e);
        semanticScore = keywordScore;
    }

    // 3. Composite Score (60% Semantic, 40% Keywords)
    const finalScore = Math.round((semanticScore * 0.6) + (keywordScore * 0.4));

    // Filter significant missing keywords (simple frequency check could be added)
    // For now, return top 10 unique missing words
    const topMissing = missingKeywords.slice(0, 10);

    return {
        score: Math.min(100, Math.max(0, finalScore)),
        missingKeywords: topMissing,
        matchedKeywords: matchedKeywords.slice(0, 20)
    };
}
