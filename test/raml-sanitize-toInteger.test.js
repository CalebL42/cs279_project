const { toInteger } = require('./raml-sanitize');

test('toInteger bypass with string containing decimal', () => {
    const input = '123.0';
    expect(toInteger(input)).toBe(NaN);
});

test('toInteger bypass with leading zeros', () => {
    const input = '0001';
    expect(toInteger(input)).toBe(NaN);
});

test('toInteger bypass with padded space', () => {
    const input = ' 42';
    expect(toInteger(input)).toBe(NaN);
});

