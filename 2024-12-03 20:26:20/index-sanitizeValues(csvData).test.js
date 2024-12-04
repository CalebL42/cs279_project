const { sanitizeValues } = require('sanitize-csv');

test('sanitize should escape leading =', () => {
    const args = { delimiter: ',', quotes: '"' };
    expect(sanitizeValues('=SUM(A1:A2)', args)).toBe('\'=SUM(A1:A2)');
});

test('sanitize should escape leading +', () => {
    const args = { delimiter: ',', quotes: '"' };
    expect(sanitizeValues('+CMD|\' /C calc\'!A0', args)).toBe('\'+CMD|\' /C calc\'!A0');
});

test('sanitize should escape tab character', () => {
    const args = { delimiter: ',', quotes: '"' };
    expect(sanitizeValues('\tText', args)).toBe('\\tText');
});

test('sanitize should escape leading -', () => {
    const args = { delimiter: ',', quotes: '"' };
    expect(sanitizeValues('-Passthrough', args)).toBe('\'-Passthrough');
});

test('sanitize should escape leading @', () => {
    const args = { delimiter: ',', quotes: '"' };
    expect(sanitizeValues('@ProvidesImport', args)).toBe('\'@ProvidesImport');
});

test('sanitize should handle regular text with embedded =', () => {
    const args = { delimiter: ',', quotes: '"' };
    expect(sanitizeValues('Hello=World', args)).toBe('Hello=World');
});

test('sanitize should not allow HTML tags', () => {
    const args = { delimiter: ',', quotes: '"' };
    expect(sanitizeValues('<script>alert(\'x\')</script>', args)).not.toContain('<script>');
});

test('sanitize should handle injection attempts', () => {
    const args = { delimiter: ',', quotes: '"' };
    expect(sanitizeValues('"+"System(\"/bin/sh\")"', args)).not.toContain('+');
});

test('sanitize should sanitize concatenated expressions', () => {
    const args = { delimiter: ',', quotes: '"' };
    expect(sanitizeValues('=CONCATENATE("Hello,", "World")', args)).toBe('\'=CONCATENATE("Hello,", "World")');
});

test('sanitize should not allow commands after regular text', () => {
    const args = { delimiter: ',', quotes: '"' };
    expect(sanitizeValues('NormalText,=SUM(A1:A2)', args)).toBe('NormalText,\'=SUM(A1:A2)');
});

const dirty_bypasser = "=,=IMPORTXML(url, xpath_query)"
const result = sanitizeValues(dirty_bypasser);
//result will still be "'=,=IMPORTXML(url, xpath_query)"


