const { toBoolean } = require('./raml-sanitize');

test('toBoolean interprets \"yes\" as true bypassing proper boolean check', () => {
  const dirtyInput = 'yes';
  const result = toBoolean(dirtyInput);
  expect(result).toBe(true);
});


test('toBoolean with numerical value \"1.0\" returns true, demonstrating false detection', () => {
  const dirtyInput = '1.0';
  const result = toBoolean(dirtyInput);
  expect(result).toBe(true);
});


test('toBoolean with non-zero string \"maybe\", expect result as true, showing logical bypass', () => {
  const dirtyInput = 'maybe';
  const result = toBoolean(dirtyInput);
  expect(result).toBe(true);
});


