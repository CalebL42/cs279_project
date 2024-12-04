const { email } = require('<package_name>/lib/sanitizers.js');

jest.mock('validator', () => ({ normalizeEmail: jest.fn() }));

test('email sanitizer should handle uncommon TLDs', () => {
  const input = 'EXAMple@doesnotexist.!tld';
  const output = email(input);
  expect(output).toEqual('example@doesnotexist.!tld');
});

test('email sanitizer should handle spaces correctly', () => {
  const input = ' test @ domain . com ';
  const output = email(input);
  expect(output).toEqual('test@domain.com');
});

test('email sanitizer should handle escaped characters correctly', () => {
  const input = 'te\sst@exam\\ple.com';
  const output = email(input);
  expect(output).toEqual('test@example.com');
});

