const { int } = require('./sanitizers');

test('int should not interpret strings with spaces correctly', () => {
  const input = ' 42 ';
  const output = int(input);
  expect(output).not.toBe(parseInt(input, 10));
  expect(output).toBe(42); // should handle spaces properly
});

test('int should catch unusual numeric formats', () => {
  const input = '0x1A';
  const output = int(input);
  expect(output).not.toBe(parseInt(input, 10));
  expect(output).toBe(26); // expects conversion from hex
});

test('int should reject scientific notation without loss', () => {
  const input = '1e2';
  const output = int(input);
  expect(output).not.toBe(parseInt(input, 10));
  expect(output).toBe(100); // expects compatibility with scientific notation
});

