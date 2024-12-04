const { sanitizeValues } = require('../node_modules/sanitize-csv');

test('sanitizes inputs starting with equals in the middle of string', () => {
    const result = sanitizeValues('normal,=SUM(A1:B1),normal', { delimiter: ',', quotes: '"' });
    expect(result).not.toContain('=SUM(A1:B1)'); // Should escape or sanitize
});

test('sanitizes inputs starting with plus in the middle of string', () => {
    const result = sanitizeValues('test,+A1:B1,inject', { delimiter: ',', quotes: '"' });
    expect(result).not.toContain('+A1:B1');
});

test('sanitizes inputs with @ symbol in middle of string', () => {
    const result = sanitizeValues('random,@cmd,exec', { delimiter: ',', quotes: '"' });
    expect(result).not.toContain('@cmd');
});

test('detects placeholder tab character not escaped', () => {
    const result = sanitizeValues('tab\tvalue,exp', { delimiter: ',', quotes: '"' });
    expect(result).not.toContain('tab\tvalue');
});

test('detects placeholder carriage return character exposure', () => {
    const result = sanitizeValues('carriage\rreturn,exp', { delimiter: ',', quotes: '"' });
    expect(result).not.toContain('carriage\rreturn');
});

test('escaped quote manipulation inside CSV', () => {
    const result = sanitizeValues('escaped"quote,test', { delimiter: ',', quotes: '"' });
    expect(result).not.toContain('escaped"quote');
});

test('semicolon injection bypasses sanitization', () => {
    const result = sanitizeValues('semicolon;inject,test', { delimiter: ',', quotes: '"' });
    expect(result).not.toContain('semicolon;inject');
});

test('equals prefixed command should be sanitized', () => {
    const result = sanitizeValues('=-cmd,valid,invalid', { delimiter: ',', quotes: '"' });
    expect(result).not.toContain('=-cmd');
});

test('adjacent at and minus special character bypass', () => {
    const result = sanitizeValues('adjacent,special,-@chars', { delimiter: ',', quotes: '"' });
    expect(result).not.toContain('-@chars');
});

test('leading space causing unseen equals sanitation attempt', () => {
    const result = sanitizeValues('leading space, =unseen', { delimiter: ',', quotes: '"' });
    expect(result).not.toContain('=unseen');
});

