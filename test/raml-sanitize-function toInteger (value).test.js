const { toInteger } = require('./raml-sanitize');

test('toInteger misinterpret \"10.5\" as NaN indicating a bypass in integer check', () => {
  const dirtyInput = '10.5';
  const result = toInteger(dirtyInput);
  expect(result).toBeNaN();
});


test('toInteger with a non-numeric string \"abc\" should return NaN', () => {
  const dirtyInput = 'abc';
  const result = toInteger(dirtyInput);
  expect(result).toBeNaN();
});


test('toInteger using hexadecimal string \"0x1F\" should return NaN', () => {
  const dirtyInput = '0x1F';  // Hexadecimal representation
  const result = toInteger(dirtyInput);
  expect(result).toBeNaN();
});


