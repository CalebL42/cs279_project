const toDate = require('./fuzzed_packages/raml-sanitize/package/raml-sanitize.js').toDate;

test('should throw error for non-date string input', () => {
  const dirtyInput = 'this is not a date';
  expect(() => toDate(dirtyInput)).toThrow('toDate: value is not a parsable date');
});

test('should throw error for malformed date string', () => {
  const dirtyInput = '99/99/9999';
  expect(() => toDate(dirtyInput)).toThrow('toDate: value is not a parsable date');
});

test('should throw error for randomized string with date characters', () => {
  const dirtyInput = '2021-09-31T19:00:00UNKNOWN';
  expect(() => toDate(dirtyInput)).toThrow('toDate: value is not a parsable date');
});

