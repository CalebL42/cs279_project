const { toNumber } = require('./raml-sanitize');

test('toNumber sanitizes \"Infinity\" as NaN to demonstrate logical bypass', () => {
  const dirtyInput = 'Infinity';
  const result = toNumber(dirtyInput);
  expect(result).toBeNaN();
});


test('toNumber with scientific notation \"1e309\" should be NaN', () => {
  const dirtyInput = '1e309'; // A very large number causing Infinity
  const result = toNumber(dirtyInput);
  expect(result).toBeNaN();
});


test('toNumber using string that looks like a number \"123abc\" should be NaN', () => {
  const dirtyInput = '123abc';
  const result = toNumber(dirtyInput);
  expect(result).toBeNaN();
});


