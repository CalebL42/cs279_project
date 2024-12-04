const jstring = require('jstring');

test('handleString with complex tasks leaves script tag intact', () => {
    const task = { removeTags: null, replace: ['<script>', '', true] };
    const dirtyInput = 'Clean <script>alert("XSS")</script>';
    const sanitized = jstring.handleString(dirtyInput, task);
    const expected = 'Clean ';
    expect(sanitized).toBe(expected);
});

