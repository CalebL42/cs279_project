const jstring = require('jstring');

test('removeTags should remove all script tags, even when malformed', () => {
    const dirtyInput = 'Some text<script>alert("XSS")</script>more text<script>incomplete;';
    const sanitized = jstring.removeTags(dirtyInput);
    // The expected result assuming the function works correctly would be:
    const expected = 'Some textmore text';
    // However, due to the vulnerability, the result might still contain script tags.
    expect(sanitized).toBe(expected);
});

test('removeTags handles malformed exceptions gracefully', () => {
    const dirtyInput = '<div><scr<script>ipt>alert("XSS")</div>';
    const except = ['scr<script>ipt'];  // Intentionally malformed exception
    const sanitized = jstring.removeTags(dirtyInput, except);
    // Ideally, malformed exceptions should not cause script tags to persist
    const expected = '<div></div>';
    expect(sanitized).toBe(expected);
});

test('handleString fails to remove nested script tags when exception is given', () => {
    const task = { removeTags: ['div'], replace: ['XSS', ''] };
    const dirtyInput = '<div>XSS<script>alert("malicious")</script></div>';
    const result = jstring.handleString(dirtyInput, task);
    const expected = 'XSS'; //Doesn't expect malicious code due to sanitize but does expect content
    expect(result).toBe(expected);
});

