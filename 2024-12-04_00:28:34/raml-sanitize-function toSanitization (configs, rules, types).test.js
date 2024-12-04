const sanitizeModule = require('./fuzzed_packages/raml-sanitize/package/raml-sanitize.js');

const sanitize = sanitizeModule();

test('toSanitization should not allow undefined type conversions', () => {
  const configs = { type: 'undefinedType' };
  const inputValue = 'test';
  const sanitizedFunction = sanitize.rule({ schema: {}, name: { value: () => 'test' }, type: configs.type });
  const output = sanitizedFunction(inputValue);
  expect(output).toBe(inputValue);
});

test('toSanitization should process array items with schema', () => {
  const configs = { type: 'array', items: { type: 'number' } };
  const inputValue = "[1, 'string', 3]";
  const sanitizedFunction = sanitize.rule({ schema: configs, name: { value: () => 'numbers' } });
  const output = sanitizedFunction(inputValue);
  expect(output).toBeNull();
});

test('toSanitization should handle valid date objects normally', () => {
  const configs = { type: 'date' };
  const inputValue = {};  // Empty object
  const ruleFunction = sanitize.rule({ schema: configs, name: { value: () => 'dateField' } });
  const output = ruleFunction(inputValue);
  expect(output).toEqual(new Error('toDate: value is not a parsable date'));
});

