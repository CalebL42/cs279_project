const { sanitizeValues } = require('sanitize-csv');

test('Nested quotes test ("=Formula!")', () => {
  const input = '"=Formula!"';
  const { fieldSeperator, quotes } = { delimiter: ',', quotes: '"' };
  const result = `"'=Formula!'"`;
  expect(sanitizeValues(input, { delimiter: ',', quotes: '"' })).toBe(result);
});

test('Mixed separator and special characters (1,=Formula,2)', () => {
  const input = '1,=Formula,2';
  const result = '1,"'=Formula'",2';
  expect(sanitizeValues(input, { delimiter: ',', quotes: '"' })).toBe(result);
});

test('Multiple encoded characters (\\0x09=Inject)', () => {
  const input = '\\0x09=Inject';
  const result = '\'\\0x09'=Inject';
  expect(sanitizeValues(input, { delimiter: ',', quotes: '"' })).toBe(result);
});

test('Leading safe character with special (A=Dangerous)', () => {
  const input = 'A=Dangerous';
  const result = 'A\"'=Dangerous';
  expect(sanitizeValues(input, { delimiter: ',', quotes: '"' })).toBe(result);
});

test('Carriage return injection (Hello\r-World)', () => {
  const input = 'Hello\r-World';
  const result = 'Hello"'=World"';
  expect(sanitizeValues(input, { delimiter: ',', quotes: '"' })).toBe(result);
});

test('Double escape characters (\\\\=StillDanger)', () => {
  const input = '\\\\=StillDanger';
  const result = '\"\\'='StillDanger"';
  expect(sanitizeValues(input, { delimiter: ',', quotes: '"' })).toBe(result);
});

test('Unicode special characters (\u003DUnicodeInject)', () => {
  const input = '\u003DUnicodeInject';
  const result = '\'=UnicodeInject"';
  expect(sanitizeValues(input, { delimiter: ',', quotes: '"' })).toBe(result);
});

test('Complex script injection ("=2+3'!@')', () => {
  const input = '"=2+3'!@';
  const result = '"''=2+3'!@';
  expect(sanitizeValues(input, { delimiter: ',', quotes: '"' })).toBe(result);
});

test('Invisible separator manipulation (0x090x0DHiddenAttack)', () => {
  const input = '0x090x0DHiddenAttack';
  const result = '\'0x09"0x0D'HiddenAttack"';
  expect(sanitizeValues(input, { delimiter: ',', quotes: '"' })).toBe(result);
});

test('SQL-like logic injection (," OR 1=1 --)', () => {
  const input = '," OR 1=1 --';
  const result = ',\''" OR 1=1 --';
  expect(sanitizeValues(input, { delimiter: ',', quotes: '"' })).toBe(result);
});

