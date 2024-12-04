const { escape } = require('<package_name>/lib/sanitizers.js');

jest.mock('validator', () => ({ escape: jest.fn() }));

test('escape should handle various html symbols', () => {
  const input = "& < > \"";
  const output = escape(input);
  expect(output).toEqual('&amp; &lt; &gt; &quot;');
});

test('escape sanitizer should handle nested characters', () => {
  const input = '<<tag>>';
  const output = escape(input);
  expect(output).toEqual('&lt;&lt;tag&gt;&gt;');
});

test('escape sanitizer should fully escape possible script tag', () => {
  const input = '<input onerror=alert(1)>';
  const output = escape(input);
  expect(output).toEqual('&lt;input onerror=alert(1)&gt;');
});

