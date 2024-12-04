const { toDate } = require('./raml-sanitize');

test('toDate with unparseable date \"32/12/2020\", expected failure', () => {
  const dirtyInput = '32/12/2020'; // Invalid date
  expect(() => toDate(dirtyInput)).toThrow('toDate: value is not a parsable date');
});


test('toDate when given short date \"2020\", expect failure due to lack of context', () => {
  const dirtyInput = '2020';
  expect(() => toDate(dirtyInput)).toThrow('toDate: value is not a parsable date');
});


test('toDate using mixed format \"2020-13-01\", should throw due to invalid month', () => {
  const dirtyInput = '2020-13-01'; // Invalid month
  expect(() => toDate(dirtyInput)).toThrow('toDate: value is not a parsable date');
});


