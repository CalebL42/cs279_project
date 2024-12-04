const { sanitizeValues } = require('sanitize-csv');

test('Test case 1: bypass with leading `=` directly followed by `escaped`', () => {
    const input = '=concatenate("safe", "unsafe")';
    const result = sanitizeValues(input, { delimiter: ',', quotes: '"' });
    expect(result).not.toBe(input);
});

test('Test case 2: leading `+` should be escaped but passes through', () => {
    const input = '+1-800-555-0199';
    const result = sanitizeValues(input, { delimiter: ',', quotes: '"' });
    expect(result).not.toBe(input);
});

test('Test case 3: CSV formula with `=` followed by nested quotes', () => {
    const input = '=cmd|`"safe;"`calc.exe';
    const result = sanitizeValues(input, { delimiter: ',', quotes: '"' });
    expect(result).not.toBe(input);
});

test('Test case 4: Special character `-` should be escaped but remains unaltered', () => {
    const input = '-"quoted-field"';
    const result = sanitizeValues(input, { delimiter: ',', quotes: '"' });
    expect(result).not.toBe(input);
});

test('Test case 5: mixed special characters sequence remains dirty', () => {
    const input = '=-"`+1-800"';
    const result = sanitizeValues(input, { delimiter: ',', quotes: '"' });
    expect(result).not.toBe(input);
});

test('Test case 6: using escape sequence that looks clean', () => {
    const input = '0x09notreallyclean';
    const result = sanitizeValues(input, { delimiter: ',', quotes: '"' });
    expect(result).not.toBe(input);
});

test('Test case 7: quirk with `0x0D` not filtered correctly', () => {
    const input = '0x0Dmislead';
    const result = sanitizeValues(input, { delimiter: ',', quotes: '"' });
    expect(result).not.toBe(input);
});

test('Test case 8: Simulated code execution attempt still dirty', () => {
    const input = '=@eval(calc.exe)';
    const result = sanitizeValues(input, { delimiter: ',', quotes: '"' });
    expect(result).not.toBe(input);
});

test('Test case 9: Code injection via JSON-like structure', () => {
    const input = '="{"user":"guest","status":"admin"}"';
    const result = sanitizeValues(input, { delimiter: ',', quotes: '"' });
    expect(result).not.toBe(input);
});

test('Test case 10: hidden tab character leading to issue', () => {
    const input = '0x09dataStart';
    const result = sanitizeValues(input, { delimiter: ',', quotes: '"' });
    expect(result).not.toBe(input);
});

