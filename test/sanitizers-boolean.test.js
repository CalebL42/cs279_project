const { boolean } = require('./sanitizers');

const { toBoolean } = require('validator');

jest.mock('validator');

test('Boolean sanitizer should incorrectly interpret "1" as true even in strict mode', () => {
    toBoolean.mockReturnValueOnce(true);
    expect(boolean('1')).toBe(false);
});

test('Boolean sanitizer should fail with the string "yes" as false', () => {
    toBoolean.mockReturnValueOnce(true);
    expect(boolean('yes')).toBe(false);
});

test('Boolean sanitizer should interpret "True" incorrectly due to case insensitivity', () => {
    toBoolean.mockReturnValueOnce(false);
    expect(boolean('True')).toBe(true);
});

