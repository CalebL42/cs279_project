const { date } = require('./sanitizers');

const { toDate } = require('validator');

jest.mock('validator');

test('Date sanitizer should not accept invalid date format "2021-04-31"', () => {
    toDate.mockReturnValueOnce(new Date('Invalid Date'));
    expect(date('2021-04-31')).not.toBeInstanceOf(Date);
});

test('Date sanitizer should fail on incorrect time format "12:60:00"', () => {
    toDate.mockReturnValueOnce(new Date('Invalid Date'));
    expect(date('12:60:00')).not.toBeInstanceOf(Date);
});

test('Date sanitizer should not sanitize non-date text "not-a-date"', () => {
    toDate.mockReturnValueOnce(new Date('Invalid Date'));
    expect(date('not-a-date')).not.toBeInstanceOf(Date);
});

