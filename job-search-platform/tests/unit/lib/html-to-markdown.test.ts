import { stripHtmlToMarkdown, estimateTokens } from '@/lib/ingest/html-to-markdown';

describe('stripHtmlToMarkdown', () => {
    it('returns empty string for empty input', () => {
        expect(stripHtmlToMarkdown('')).toBe('');
        expect(stripHtmlToMarkdown(null as any)).toBe('');
    });

    it('strips script and style blocks entirely', () => {
        const html = '<script>alert("xss")</script><p>Job description</p><style>.foo{color:red}</style>';
        const result = stripHtmlToMarkdown(html);
        expect(result).not.toContain('alert');
        expect(result).not.toContain('.foo');
        expect(result).toContain('Job description');
    });

    it('strips nav, header, footer blocks', () => {
        const html = '<nav>Home | Jobs | About</nav><p>Apply now</p><footer>© 2026</footer>';
        const result = stripHtmlToMarkdown(html);
        expect(result).not.toContain('Home | Jobs');
        expect(result).not.toContain('© 2026');
        expect(result).toContain('Apply now');
    });

    it('converts headings to markdown', () => {
        const html = '<h1>Senior Engineer</h1><h2>About the Role</h2><h3>Requirements</h3>';
        const result = stripHtmlToMarkdown(html);
        expect(result).toContain('# Senior Engineer');
        expect(result).toContain('## About the Role');
        expect(result).toContain('### Requirements');
    });

    it('converts list items to markdown bullets', () => {
        const html = '<ul><li>Python experience</li><li>5+ years</li></ul>';
        const result = stripHtmlToMarkdown(html);
        expect(result).toContain('- Python experience');
        expect(result).toContain('- 5+ years');
    });

    it('decodes HTML entities', () => {
        const html = '<p>Salary: $80,000 &amp; benefits. Must be &lt;senior&gt;</p>';
        const result = stripHtmlToMarkdown(html);
        expect(result).toContain('&');
        expect(result).toContain('<senior>');
        expect(result).not.toContain('&amp;');
        expect(result).not.toContain('&lt;');
    });

    it('strips all remaining HTML tags', () => {
        const html = '<div class="foo"><span style="color:red">Engineer</span></div>';
        const result = stripHtmlToMarkdown(html);
        expect(result).not.toContain('<');
        expect(result).not.toContain('>');
        expect(result).toContain('Engineer');
    });

    it('collapses multiple blank lines to two', () => {
        const html = '<p>Line 1</p><p></p><p></p><p></p><p>Line 2</p>';
        const result = stripHtmlToMarkdown(html);
        expect(result).not.toMatch(/\n{3,}/);
    });

    it('significantly reduces token count on real career page HTML', () => {
        // Simulate a bloated HTML page
        const nav = '<nav>' + '<a href="#">'.repeat(30) + 'link</a>'.repeat(30) + '</nav>';
        const script = '<script>' + 'var x = 1;'.repeat(200) + '</script>';
        const content = '<h2>About the Job</h2><p>We need a great engineer with Python skills.</p>';
        const html = nav + script + content;

        const result = stripHtmlToMarkdown(html);
        expect(estimateTokens(result)).toBeLessThan(estimateTokens(html) * 0.2); // >80% reduction
        expect(result).toContain('About the Job');
        expect(result).toContain('Python skills');
    });

    it('is a safe no-op on already-clean text', () => {
        const clean = 'Senior Software Engineer\n\nWe are looking for a Python developer.\n\n- 5+ years experience\n- Remote OK';
        const result = stripHtmlToMarkdown(clean);
        // Should preserve the text content
        expect(result).toContain('Senior Software Engineer');
        expect(result).toContain('Python developer');
        expect(result).toContain('5+ years');
    });
});

describe('estimateTokens', () => {
    it('approximates token count as text length / 4', () => {
        const text = 'a'.repeat(400);
        expect(estimateTokens(text)).toBe(100);
    });
});
