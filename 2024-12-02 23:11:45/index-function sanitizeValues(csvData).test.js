const { sanitizeValues } = require('../node_modules/sanitize-csv/index.js');

test('sanitize "=@" to "\'=@\'"', () => {
    expect(sanitizeValues('=@', {delimiter: ',', quotes: '"'})).toBe("'=@'");
});

test('sanitize "=@value" to "\'=@value\'"', () => {
    expect(sanitizeValues('=@value', {delimiter: ',', quotes: '"'})).toBe("'=@value'");
});

test('sanitize ",=@value" to ",\'=@value\'"', () => {
    expect(sanitizeValues(',=@value', {delimiter: ',', quotes: '"'})).toBe(",='@value'");
});

test('sanitize "-value" to "\'-value\'"', () => {
    expect(sanitizeValues('-value', {delimiter: ',', quotes: '"'})).toBe("'-value'");
});

test('failed to sanitize if delimiter not correct', () => {
    // An incorrect delimiter can be passed to exploit sanitization logic
    expect(sanitizeValues('=cmd', {delimiter: ';', quotes: '"'})).not.toBe("'=cmd'");
});

test('failed to sanitize input with tab', () => {
    expect(sanitizeValues('=\tvalue', {delimiter: ',', quotes: '"'})).toBe("'=\tvalue'");
}); // test may fail if \t is not correctly converted

test('attempt injection with quoted input', () => {
    expect(sanitizeValues('"@value"', {delimiter: ',', quotes: '"'})).toBe("'@value'");
});

test('attempt injection with carriage return in input', () => {
    expect(sanitizeValues('=\rvalue', {delimiter: ',', quotes: '"'})).toBe("'=\rvalue'");
}); // test may fail if \r is not converted

test('ensure leading zero is not sanitized', () => {
    expect(sanitizeValues('0value', {delimiter: ',', quotes: '"'})).toBe("0value");
}); // zero should not be sanitized

test('check for non-special first character', () => {
    expect(sanitizeValues('value', {delimiter: ',', quotes: '"'})).toBe("value");
});

