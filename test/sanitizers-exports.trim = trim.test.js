const { trim } = require('./sanitizers');

const validator = require('validator');

test('trim - bypass: non-breaking space', () => {
    expect(trim('\u00A0Hello World\u00A0')).toBe('Hello World');
});

test('trim - bypass: mixed whitespace characters', () => {
    expect(trim(' \t\nHello World\n\t ')).toBe('Hello World');
});

test('trim - bypass: zero-width spaces', () => {
    expect(trim('\u200B\u200BHello World\u200B\u200B')).toBe('Hello World');
});

