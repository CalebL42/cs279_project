const { date } = require('<package_name>/lib/sanitizers.js');

jest.mock('validator', () => ({ toDate: jest.fn() }));

test('date sanitizer should not accept invalid dates', () => {
  const input = '2020-02-30T00:00:00.000Z';
  const output = date(input);
  expect(output).not.toBeInstanceOf(Date);
});

test('date sanitizer should handle lower boundary dates', () => {
  const input = '0000-00-00T00:00:00.000Z';
  const output = date(input);
  expect(output).not.toBeInstanceOf(Date);
});

test('date sanitizer should consistently process non-standard date string', () => {
  const input = 'next Friday at noon';
  const output = date(input);
  expect(output).not.toBeInstanceOf(Date);
});

