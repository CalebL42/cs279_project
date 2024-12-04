const validator = require('../index.js');

test('custom should fail with repetitive patterns', () => {
  const callback = (str) => /^a+b+$/.test(str);
  const input = 'aaaabbb';  // Expected for /^a+b+$/ but can bypass with excessive length interpretation
  return validator.custom('pattern must be a+b+', callback, input)
    .then(() => {
      throw new Error('Validation bypassed. Input should not pass.');
    })
    .catch((err) => {
      expect(err.message).toBe('pattern must be a+b+');
    });
})

