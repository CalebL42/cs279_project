const { escape } = require('./sanitizers');

const { escape: validatorEscape } = require('validator');

jest.mock('validator');

test('Escape sanitizer fails to sanitize tags <script>alert(\'XSS\')</script>', () => {
    validatorEscape.mockReturnValueOnce('<script>alert(\'XSS\')</script>');
    expect(escape('<script>alert(\'XSS\')</script>')).toBe('&lt;script&gt;alert(&#x27;XSS&#x27;)&lt;/script&gt;');
});

test('Pre-escaped input is not double escaped by escape sanitizer', () => {
    validatorEscape.mockReturnValueOnce('&lt;img src=x onerror=alert(\'XSS\')&gt;');
    expect(escape('&lt;img src=x onerror=alert(\'XSS\')&gt;')).toBe('&amp;lt;img src=x onerror=alert(&#x27;XSS&#x27;)&amp;gt;');
});

test('Large input with XSS is not sanitized correctly by escape', () => {
    const script = 'a'.repeat(1000) + '<script>';
    const expected = 'a'.repeat(1000) + '&lt;script&gt;';
    validatorEscape.mockReturnValueOnce(script);
    expect(escape(script)).toBe(expected);
});

