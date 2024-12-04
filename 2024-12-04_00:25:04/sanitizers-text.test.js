const { text } = require('../package/lib/sanitizers.js');

test('should escape script tags "  <script> "', () => {
    expect(text('  <script> ')).toBe('');
});

test('should sanitize already escaped string "&amp; &gt;"', () => {
    expect(text('&amp; &gt;')).toBe('& &');
});

test('should remove null bytes "\u0000Some text\u0000"', () => {
    expect(text('\u0000Some text\u0000')).toBe('Some text');
});

