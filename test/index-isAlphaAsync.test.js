const validator = require('../index.js');

test('isAlphaAsync should fail with Unicode visually-deceptive chars', () => {
  const input = '𝚊bc𝒟';  // Use Unicode chars that look like alpha but aren't in ASCII
  return validator.isAlphaAsync('should be alpha chars only', input)
    .then(() => {
      throw new Error('Validation bypassed. Input should not pass.');
    })
    .catch((err) => {
      expect(err.message).toBe('should be alpha chars only');
    });
})

