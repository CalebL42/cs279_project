const { boolean } = require('./sanitizers');

const validator = require('validator');

test('boolean - bypass: unconventional truthy string', () => {
    expect(boolean('yes')).toBe(true);
});

test('boolean - bypass: misleading falsy string', () => {
    expect(boolean('noOne')).toBe(false);
});

test('boolean - improper input handling', () => {
    expect(boolean('maybe')).toBe(false);
});

