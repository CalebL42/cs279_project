const ramlSanitize = require('./fuzzed_packages/raml-sanitize/package/raml-sanitize.js')();

const { WebApiParser } = require('webapi-parser');

test('sanitize.rule should handle malformed numbers', () => {
  const mockElement = {
    name: { value: () => 'price' },
    schema: { dataType: { value: () => 'number' } }
  };
  const sanitizeRule = ramlSanitize.rule(mockElement);
  const dirtyInput = 'NaN<script>alert(1)</script>';
  expect(() => sanitizeRule(dirtyInput)).toThrowError('toNumber: value is not finite');
});

test('sanitize.rule should enforce integer type strictly', () => {
  const mockElement = {
    name: { value: () => 'count' },
    schema: { dataType: { value: () => 'integer' } }
  };
  const sanitizeRule = ramlSanitize.rule(mockElement);
  const dirtyInput = '123.45<script>alert(2)</script>';
  expect(() => sanitizeRule(dirtyInput)).toThrowError('toInteger: value is not a multiple of 1');
});

test('sanitize.rule should maintain string sanitation', () => {
  const mockElement = {
    name: { value: () => 'comment' },
    schema: { dataType: { value: () => 'string' } }
  };
  const sanitizeRule = ramlSanitize.rule(mockElement);
  const dirtyInput = '<img src=x onerror=alert(3)>';
  const sanitized = sanitizeRule(dirtyInput);
  expect(sanitized).toBe('&lt;img src=x onerror=alert(3)&gt;');
});

