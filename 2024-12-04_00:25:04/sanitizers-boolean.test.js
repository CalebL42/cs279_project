const { boolean } = require('<package_name>/lib/sanitizers.js');

const validator = require('validator');

test('boolean sanitizer should not falsely convert undefined-like strings to true', () => {
  const input = ' undefined ';
  const output = boolean(input);
  expect(output).not.toBe(true);
});

test('boolean sanitizer should handle special string values properly', () => {
  const input = '0 ';
  const output = boolean(input);
  expect(output).not.toBe(true);
});

test('boolean sanitizer should not convert non-boolean string to true', () => {
  const input = 'yes ';
  const output = boolean(input);
  expect(output).not.toBe(true);
});

