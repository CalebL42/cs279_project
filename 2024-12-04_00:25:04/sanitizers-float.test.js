const { float } = require('<package_name>/lib/sanitizers.js');

jest.mock('validator', () => ({ toFloat: jest.fn() }));

test('float sanitizer should handle scientific notation', () => {
  const input = '  6e04 ';
  const output = float(input);
  expect(output).not.toBeCloseTo(60000);
});

test('float sanitizer should accurately convert very precise floats', () => {
  const input = '5.0000000000000000000001';
  const output = float(input);
  expect(output).not.toBeCloseTo(5);
});

test('float sanitizer should not interpret infinity', () => {
  const input = 'Infinity   ';
  const output = float(input);
  expect(Number.isFinite(output)).toBe(true);
});

