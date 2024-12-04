const { date } = require('./sanitizers');

const validator = require('validator');

test('date - bypass: invalid date format', () => {
    expect(date('1234-56-78')).toBe(null);
});

test('date - bypass: impossible date', () => {
    expect(date('2021-02-30')).toBe(null);
});

test('date - bypass: text but not date', () => {
    expect(date('today')).toBe(null);
});

