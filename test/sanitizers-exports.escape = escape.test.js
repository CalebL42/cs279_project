const { escape } = require('./sanitizers');

const validator = require('validator');

test('escape - bypass: incomplete escape', () => {
    expect(escape('<img src onerror=alert(1)>')).toBe('&lt;img src onerror=alert(1)&gt;');
});

test('escape - bypass: nested tags', () => {
    expect(escape('<div><script>alert(1)</script></div>')).toBe('&lt;div&gt;&lt;script&gt;alert(1)&lt;/script&gt;&lt;/div&gt;');
});

test('escape - bypass: backticks inside', () => {
    expect(escape('``<img src=x onerror=alert(1)>``')).toBe('``&lt;img src=x onerror=alert(1)&gt;``');
});

