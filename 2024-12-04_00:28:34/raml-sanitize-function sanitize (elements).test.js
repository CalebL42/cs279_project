const sanitizeModule = require('./fuzzed_packages/raml-sanitize/package/raml-sanitize.js');

const sanitize = sanitizeModule();

test('sanitize function should not allow object prototype pollution', () => {
  const elements = [{ name: { value: () => '__proto__' }, type: 'object' }];
  const input = JSON.stringify({});
  const sanitized = sanitize(elements)({ '__proto__': { polluted: 'yes' } });
  expect(sanitized.__proto__.polluted).toBeUndefined();
});

test('sanitize function should not interpret JSON arrays as objects', () => {
  const elements = [{ name: { value: () => 'data' }, type: 'array' }];
  const input = '{ "key": "value" }';
  const sanitized = sanitize(elements)({ data: input });
  expect(sanitized.data).toBe(null);
});

test('sanitize function should handle numeric strings', () => {
  const elements = [{ name: { value: () => 'numberString' }, type: 'number' }];
  const input = '123abc';  // Invalid number input
  const sanitized = sanitize(elements)({ numberString: input });
  expect(sanitized.numberString).toBeNaN();
});

