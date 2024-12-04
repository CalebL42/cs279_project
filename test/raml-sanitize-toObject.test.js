const { toObject } = require('./raml-sanitize');

test('toObject bypass with JSON array', () => {
    const input = '[]';
    expect(() => toObject(input)).toThrow();
});

test('toObject bypass with JSON string null', () => {
    const input = 'null';
    expect(() => toObject(input)).toThrow();
});

test('toObject bypass with malformed JSON', () => {
    const input = '"{ key: \"value\" }"';
    expect(() => toObject(input)).toThrow();
});

