const sanitizeModule = require('./fuzzed_packages/raml-sanitize/package/raml-sanitize.js');

const sanitize = sanitizeModule();

test('sanitize.rule should not allow object prototype pollution', () => {
  const input = { schema: { type: 'object' }, name: { value: () => '__proto__' } };
  const inputValue = JSON.stringify({ 'polluted': 'yes' });
  const ruleFunction = sanitize.rule(input);
  const output = ruleFunction(inputValue);
  expect(output.__proto__.polluted).toBeUndefined();
});

test('sanitize.rule should reject non-number strings for number type', () => {
  const input = { schema: { type: 'number' }, name: { value: () => 'numberString' } };
  const inputValue = 'notANumber';
  const ruleFunction = sanitize.rule(input);
  const output = ruleFunction(inputValue);
  expect(output).toBeNaN();
});

test('sanitize.rule should handle date inputs correctly', () => {
  const input = { schema: { type: 'date' }, name: { value: () => 'dateString' } };
  const inputValue = 'invalid-date';
  const ruleFunction = sanitize.rule(input);
  const output = ruleFunction(inputValue);
  expect(output).toBeInstanceOf(Error);
});

