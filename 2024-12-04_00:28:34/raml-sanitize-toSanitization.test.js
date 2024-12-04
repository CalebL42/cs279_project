const ramlSanitize = require('./fuzzed_packages/raml-sanitize/package/raml-sanitize.js')();

const { WebApiParser } = require('webapi-parser');

test('toSanitization should convert nested object types', () => {
  const configs = [{ name: 'user', type: 'object', properties: [{ name: 'role', type: 'string' }] }];
  const toSanitize = ramlSanitize.TYPES.object;
  const sanitized = toSanitize('{ "role": "<svg/onload=alert(1)>" }');
  expect(sanitized.role).toBe('&lt;svg/onload=alert(1)&gt;');
});

test('toSanitization should run rules on arrays', () => {
  const configs = [{ type: 'array', items: { type: 'string' } }];
  const toSanitize = ramlSanitize.TYPES.array;
  const dirtyInput = '["<img src=x onerror=alert(2)>", "clean"]';
  const sanitized = toSanitize(dirtyInput);
  expect(sanitized[0]).toBe('&lt;img src=x onerror=alert(2)&gt;');
});

test('toSanitization should handle invalid defaults', () => {
  const configs = [{ name: 'username', type: 'string', default: '<invalid></invalid>' }];
  const toSanitize = ramlSanitize.TYPES.string;
  const sanitized = toSanitize(null);
  expect(sanitized).toBe('&lt;invalid&gt;&lt;/invalid&gt;');
});

