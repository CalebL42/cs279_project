const { toArray } = require('./raml-sanitize');

test('toArray bypass with JSON that is not an array', () => {
    const input = '{"foo": "bar"}';
    expect(() => toArray(input)).toThrow();
});

test('toArray bypass with mixed type array', () => {
    const input = '[1, "a", {}]';
    expect(() => toArray(input)).toThrow();
});

test('toArray bypass with array containing falsy values', () => {
    const input = '[null, undefined, 0]';
    expect(() => toArray(input)).toThrow();
});

