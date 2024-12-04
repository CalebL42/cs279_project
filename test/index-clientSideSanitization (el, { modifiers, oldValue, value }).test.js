const { clientSideSanitization } = require('./fuzzed_packages/vue-sanitize-directive/package/src/index.js');

test('clientSideSanitization should not allow <img> with onerror', () => {
  const el = document.createElement('div');
  const dirtyInput = '<img src=x onerror=alert(1)//>';
  const expectedOutput = '&lt;img src=x onerror=alert(1)//&gt;';
 
  clientSideSanitization(el, { modifiers: {}, oldValue: '', value: dirtyInput });

  expect(el.innerHTML).toBe(expectedOutput);
});

test('clientSideSanitization should not bypass using <svg><script>', () => {
  const el = document.createElement('div');
  const dirtyInput = '<svg><script>alert("XSS")</script></svg>';
  const expectedOutput = '&lt;svg&gt;&lt;script&gt;alert("XSS")&lt;/script&gt;&lt;/svg&gt;';

  clientSideSanitization(el, { modifiers: { nothing: true }, oldValue: '', value: dirtyInput });

  expect(el.innerHTML).toBe(expectedOutput);
});

test('clientSideSanitization should escape malformed URL javascript: call', () => {
  const el = document.createElement('div');
  const dirtyInput = '<a href=\'javascript:alert(1)\'>Click</a>';
  const expectedOutput = '<a>Click</a>';

  clientSideSanitization(el, { modifiers: {}, oldValue: '', value: dirtyInput });

  expect(el.innerHTML).toBe(expectedOutput);
});

