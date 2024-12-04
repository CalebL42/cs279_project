const { text } = require('./lib/sanitizers');

test('text sanitizer should escape script tags', () => {
    const dirtyInput = '<script>alert(1)</script>';
    expect(text(dirtyInput)).toBe('&lt;script&gt;alert(1)&lt;/script&gt;');
});

test('text sanitizer should correctly handle malicious whitespace trimming', () => {
    const dirtyInput = ' text '; // Check surrounding spaces handling without escaping
    expect(text(dirtyInput)).toBe('text');
});

test('text sanitizer should return empty string for only whitespace', () => {
    const dirtyInput = '     '; // Input is only whitespace.
    expect(text(dirtyInput)).toBe('');
});

