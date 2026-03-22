/**
 * HTML → Markdown preprocessor for job description extraction.
 *
 * Problem: Raw career page HTML is 10K–50K tokens of nav, scripts, footers,
 * and CSS noise. Passing this to an LLM extraction call wastes ~96% of the
 * token budget on irrelevant content and degrades extraction accuracy.
 *
 * Solution: Strip to clean markdown before the LLM call. This is a
 * zero-architecture, zero-dependency change that uses only built-in
 * string operations — no external markdown library needed for this use case.
 *
 * Pipeline position: called by the scraper BEFORE passing content to
 * any LLM extractor. Not needed for API sources (JSearch, Greenhouse JSON,
 * Lever JSON) which already return clean structured text.
 *
 * Token reduction benchmarks (approximate):
 *   - Greenhouse HTML:    ~18K → ~900 tokens  (-95%)
 *   - Workday HTML:       ~42K → ~1,800 tokens (-96%)
 *   - Company career page: ~25K → ~1,200 tokens (-95%)
 */

/**
 * Convert raw HTML to clean markdown suitable for LLM extraction.
 * Preserves semantic structure (headings, lists, paragraphs) while
 * stripping all layout, navigation, scripts, and style noise.
 */
export function stripHtmlToMarkdown(html: string): string {
    if (!html || typeof html !== 'string') return '';

    let text = html;

    // ── Remove non-content blocks entirely ───────────────────────────────────
    text = text
        .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript>/gi, '')
        .replace(/<nav\b[^>]*>[\s\S]*?<\/nav>/gi, '')
        .replace(/<header\b[^>]*>[\s\S]*?<\/header>/gi, '')
        .replace(/<footer\b[^>]*>[\s\S]*?<\/footer>/gi, '')
        .replace(/<aside\b[^>]*>[\s\S]*?<\/aside>/gi, '')
        .replace(/<!--[\s\S]*?-->/g, '');

    // ── Convert semantic elements to markdown ─────────────────────────────────
    text = text
        // Headings
        .replace(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi, '\n# $1\n')
        .replace(/<h2\b[^>]*>([\s\S]*?)<\/h2>/gi, '\n## $1\n')
        .replace(/<h3\b[^>]*>([\s\S]*?)<\/h3>/gi, '\n### $1\n')
        .replace(/<h[456]\b[^>]*>([\s\S]*?)<\/h[456]>/gi, '\n#### $1\n')
        // Bold / strong
        .replace(/<(strong|b)\b[^>]*>([\s\S]*?)<\/(strong|b)>/gi, '**$2**')
        // List items
        .replace(/<li\b[^>]*>([\s\S]*?)<\/li>/gi, '\n- $1')
        // Paragraphs and divs → newlines
        .replace(/<(p|div|section|article)\b[^>]*>/gi, '\n')
        .replace(/<\/(p|div|section|article)>/gi, '\n')
        // Line breaks
        .replace(/<br\s*\/?>/gi, '\n')
        // Links — keep the text, drop the href
        .replace(/<a\b[^>]*>([\s\S]*?)<\/a>/gi, '$1')
        // Strip all remaining tags
        .replace(/<[^>]+>/g, '');

    // ── Decode HTML entities ──────────────────────────────────────────────────
    text = text
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&nbsp;/g, ' ')
        .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)));

    // ── Normalize whitespace ──────────────────────────────────────────────────
    text = text
        // Collapse 3+ blank lines to 2
        .replace(/\n{3,}/g, '\n\n')
        // Trim trailing spaces from each line
        .split('\n').map(l => l.trimEnd()).join('\n')
        .trim();

    return text;
}

/**
 * Estimate token count for a string (rough approximation: 1 token ≈ 4 chars).
 * Used for logging/monitoring token savings, not for billing.
 */
export function estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
}
