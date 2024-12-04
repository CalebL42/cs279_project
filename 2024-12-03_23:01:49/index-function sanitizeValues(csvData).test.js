const { sanitizeValues } = require('../node_modules/sanitize-csv/index.js');

test('Fails to escape tab followed by formula', () => {
    const dirtyInput = '\t=SUM(A1)';
    const expectedOutput = '\"\t=SUM(A1)\"';
    expect(sanitizeValues(dirtyInput, { delimiter: ',', quotes: '"' })).toBe(expectedOutput);
});

test('Fails to handle encoded UTF sequence', () => {
    const dirtyInput = '=\u003dA1';
    const expectedOutput = '\"=\u003dA1\"';
    expect(sanitizeValues(dirtyInput, { delimiter: ',', quotes: '"' })).toBe(expectedOutput);
});

test('Fails on double equal with formula', () => {
    const dirtyInput = '==IF(1=1, TRUE)';
    const expectedOutput = '\"==IF(1=1, TRUE)\"';
    expect(sanitizeValues(dirtyInput, { delimiter: ',', quotes: '"' })).toBe(expectedOutput);
});

test('Mishandles ASCII hex of equals', () => {
    const dirtyInput = '\x3dSUM(A1)';
    const expectedOutput = '\"\x3dSUM(A1)\"';
    expect(sanitizeValues(dirtyInput, { delimiter: ',', quotes: '"' })).toBe(expectedOutput);
});

test('Ignores middle-of-word special character', () => {
    const dirtyInput = 'text,=cmd';
    const expectedOutput = 'text,\=cmd\"';
    expect(sanitizeValues(dirtyInput, { delimiter: ',', quotes: '"' })).toBe(expectedOutput);
});

test('Failure on CSV with starting dash', () => {
    const dirtyInput = 'value,-50,=SUM()';
    const expectedOutput = 'value,-50,\"=SUM()\"';
    expect(sanitizeValues(dirtyInput, { delimiter: ',', quotes: '"' })).toBe(expectedOutput);
});

test('UTF and visible special mixing', () => {
    const dirtyInput = '=\u0040\u0041';
    const expectedOutput = '\"=\u0040\u0041\"';
    expect(sanitizeValues(dirtyInput, { delimiter: ',', quotes: '"' })).toBe(expectedOutput);
});

test('Fails line break CRLF sequence sanitization', () => {
    const dirtyInput = '=SUM()\r\n-EXP()';
    const expectedOutput = '\"=SUM()\r\n-EXP()\"';
    expect(sanitizeValues(dirtyInput, { delimiter: ',', quotes: '"' })).toBe(expectedOutput);
});

test('Concatenated special sequences test', () => {
    const dirtyInput = '=-x@y';
    const expectedOutput = '\"=-x@y\"';
    expect(sanitizeValues(dirtyInput, { delimiter: ',', quotes: '"' })).toBe(expectedOutput);
});

test('Non-ASCII with leading special character handling', () => {
    const dirtyInput = '€-,@@SUM()';
    const expectedOutput = '€-,\"@@SUM()\"';
    expect(sanitizeValues(dirtyInput, { delimiter: ',', quotes: '"' })).toBe(expectedOutput);
});

