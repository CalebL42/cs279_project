const { toArray } = require('./raml-sanitize');

test('toArray parsing malformed JSON \"[invalid JSON]\" should throw error', () => {
  const dirtyInput = '[invalid JSON]';
  expect(() => toArray(dirtyInput)).toThrow('toArray: SyntaxError: Unexpected token i in JSON at position 1');
});


test('toArray using non-array JSON \"{\

