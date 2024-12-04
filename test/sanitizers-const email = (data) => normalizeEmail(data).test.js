const { email } = require('./sanitizers');

const validator = require('validator');

test('email - bypass: whitespace around email', () => {
    expect(email(' test@domain.com ')).toBe('test@domain.com');
});

test('email - bypass: misuse of special characters', () => {
    expect(email('".test.@.domain.com')).toBe(null);
});

test('email - bypass: email with subaddressing', () => {
    expect(email('test+label@domain.com')).toBe('test@domain.com');
});

