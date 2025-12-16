
import { NextResponse } from 'next/server';
import { getLLMClient } from '@/lib/llm';
import { LLMConfig } from '@/types/llm';

export const maxDuration = 300; // 5 minutes timeout for LLMs

export async function POST(request: Request) {
    try {
        const { profile } = await request.json();

        if (!profile) {
            return NextResponse.json({ error: 'Profile data is required' }, { status: 400 });
        }

        // Construct a concise context from the profile
        const context = `
        Work Experience:
        ${profile.experiences?.map((e: any) => `- ${e.position} at ${e.company}: ${e.description}`).join('\n') || 'None'}
        
        Education:
        ${profile.educations?.map((e: any) => `- ${e.degree} in ${e.field} from ${e.school}`).join('\n') || 'None'}
        
        Projects:
        ${profile.projects?.map((p: any) => `- ${p.name}: ${p.description} (${p.technologies})`).join('\n') || 'None'}
        
        Current Skills:
        ${profile.skills?.join(', ') || 'None'}
        `;

        let config: LLMConfig = {
            provider: 'gemini',
            apiKey: process.env.GOOGLE_API_KEY || '',
            model: 'gemini-1.5-flash',
            temperature: 0.7,
            maxTokens: 500
        };

        // Priority Selection
        if (process.env.OPENROUTER_API_KEY) {
            config = {
                provider: 'openrouter',
                apiKey: process.env.OPENROUTER_API_KEY,
                model: 'google/gemini-pro-1.5', // OpenRouter model ID
                temperature: 0.7,
                maxTokens: 500
            };
        } else if (process.env.OPENAI_API_KEY) {
            config = {
                provider: 'openai',
                apiKey: process.env.OPENAI_API_KEY,
                model: 'gpt-4o-mini',
                temperature: 0.7,
                maxTokens: 500
            };
        }

        if (!config.apiKey) {
            console.error("No valid API key found for: Google, OpenRouter, or OpenAI");
            return NextResponse.json({ error: 'No LLM API key configured' }, { status: 500 });
        }

        console.log('Using LLM Config:', { ...config, apiKey: '***' });
        
        let client;
        try {
            client = getLLMClient(config);
        } catch (e) {
            console.error('Failed to initialize LLM Client:', e);
            return NextResponse.json({ error: 'LLM Client Initialization Failed' }, { status: 500 });
        }

        const prompt = `
        You are a career coach expert. Based on the user's background below, suggest exactly 10 highly relevant technical or soft skills they might have but haven't listed yet.
        
        CONTEXT:
        ${context}
        
        INSTRUCTIONS:
        1. Return ONLY a JSON array of strings.
        2. Do NOT include markdown formatting (like \`\`\`json).
        3. Skills should be specific (e.g., "React.js" instead of "Coding").
        4. Do not repeat skills already listed in "Current Skills".
        
        Example Output:
        ["Skill 1", "Skill 2", ...]
        `;

        let response;
        try {
            console.log('Sending prompt to LLM...');
            response = await client.generateResponse([
                { role: 'system', content: 'You are a helpful API that returns specific JSON format.' },
                { role: 'user', content: prompt }
            ]);
            console.log('Received response from LLM');
        } catch (e) {
             console.error('LLM Generation Error:', e);
             return NextResponse.json({ error: 'LLM Generation Failed: ' + (e instanceof Error ? e.message : String(e)) }, { status: 500 });
        }

        let suggestions: string[] = [];

        try {
            // Clean up potentially messy LLM output (markdown fences)
            const cleanContent = response.content.replace(/```json/g, '').replace(/```/g, '').trim();
            suggestions = JSON.parse(cleanContent);
        } catch (e) {
            console.error('Failed to parse LLM response:', response.content);
            return NextResponse.json({ error: 'Failed to parse suggestions' }, { status: 500 });
        }

        return NextResponse.json({ suggestions });

    } catch (error) {
        console.error('Error generating assignments:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
