const toNumber = require('./fuzzed_packages/raml-sanitize/package/raml-sanitize.js').toNumber;

test('should return NaN for overly large number input', () => {
  const dirtyInput = '999999999999999999999999999999999999999999999999999999999999999999';
  const result = toNumber(dirtyInput);
  expect(result).toBe(NaN);
});

test('should return NaN for non-numeric string', () => {
  const dirtyInput = 'abcd';
  const result = toNumber(dirtyInput);
  expect(result).toBe(NaN);
});

test('should return NaN for special characters mixed with numbers', () => {
  const dirtyInput = '!@#$%^123456';
  const result = toNumber(dirtyInput);
  expect(result).toBe(NaN);
});

