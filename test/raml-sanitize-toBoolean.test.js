const toBoolean = require('./fuzzed_packages/raml-sanitize/package/raml-sanitize.js').toBoolean;

test('should return false for unexpected string values', () => {
  const dirtyInput = 'notfalse';
  const result = toBoolean(dirtyInput);
  expect(result).toBe(false);
});

test('should return false for numeric strings representing false', () => {
  const dirtyInput = '01';
  const result = toBoolean(dirtyInput);
  expect(result).toBe(false);
});

test('should return false for special character truthy string', () => {
  const dirtyInput = '!false';
  const result = toBoolean(dirtyInput);
  expect(result).toBe(false);
});

