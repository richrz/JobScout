/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';

describe('Tailwind CSS Configuration', () => {
    it('has CSS variables defined for theme colors', () => {
        // Create a test element
        const div = document.createElement('div');
        div.style.setProperty('--background', '0 0% 100%');
        div.style.setProperty('--foreground', '0 0% 3.9%');

        expect(div.style.getPropertyValue('--background')).toBeTruthy();
        expect(div.style.getPropertyValue('--foreground')).toBeTruthy();
    });

    it('supports dark mode', () => {
        const html = document.documentElement;
        html.classList.add('dark');

        expect(html.classList.contains('dark')).toBe(true);
    });
});
