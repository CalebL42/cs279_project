const ramlSanitize = require('./fuzzed_packages/raml-sanitize/package/raml-sanitize.js')();

const { WebApiParser } = require('webapi-parser');

test('sanitize should handle script tags in strings', async () => { 
  const propertyShape = {
    name: { value: () => 'description' },
    schema: { dataType: { value: () => 'string' } }
  };
  const sanitizeFunction = ramlSanitize([propertyShape]);
  const dirtyInput = { description: "<script>alert('xss')</script>" };
  const sanitized = sanitizeFunction(dirtyInput);
  expect(sanitized.description).toBe('&lt;script&gt;alert(&#39;xss&#39;)&lt;/script&gt;');
});

test('sanitize should reject malformed objects', () => {
  const propertyShape = {
    name: { value: () => 'complexParam' },
    schema: { dataType: { value: () => 'object' } }
  };
  const sanitizeFunction = ramlSanitize([propertyShape]);
  const dirtyInput = { complexParam: '"__proto__": { "polluted": true }' };
  const sanitized = sanitizeFunction(dirtyInput);
  expect(sanitized.complexParam.polluted).toBe(undefined);
});

test('sanitize should convert Date strings accurately', () => {
  const propertyShape = {
    name: { value: () => 'birthdate' },
    schema: { dataType: { value: () => 'date' } }
  };
  const sanitizeFunction = ramlSanitize([propertyShape]);
  const dirtyInput = { birthdate: 'Wed, 13 Sep 2023 00:00:00 GMT<script>alert(1)</script>' };
  const sanitized = sanitizeFunction(dirtyInput);
  expect(sanitized.birthdate.toString()).not.toContain('<script>');
});

