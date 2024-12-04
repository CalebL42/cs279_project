const { VueSanitizeDirectiveSSR } = require('./fuzzed_packages/vue-sanitize-directive/package/src/index.js');

test('VueSanitizeDirectiveSSR should escape script content', () => {
  const vnode = { data: { domProps: {} } };
  const dirtyInput = '<script>alert(1)</script>';
  const expectedOutput = '&lt;script&gt;alert(1)&lt;/script&gt;';

  VueSanitizeDirectiveSSR(vnode, { modifiers: {}, value: dirtyInput });

  expect(vnode.data.domProps.innerHTML).toBe(expectedOutput);
});

test('VueSanitizeDirectiveSSR should handle malformed XSS payload', () => {
  const vnode = { data: { domProps: {} } };
  const dirtyInput = '<img src=x onerror=alert(1)>" />';
  const expectedOutput = '&lt;img src=x onerror=alert(1)&gt;&quot; /&gt;';

  VueSanitizeDirectiveSSR(vnode, { modifiers: {}, value: dirtyInput });

  expect(vnode.data.domProps.innerHTML).toBe(expectedOutput);
});

test('VueSanitizeDirectiveSSR should sanitize malicious event handlers', () => {
  const vnode = { data: { domProps: {} } };
  const dirtyInput = '<button onclick=alert("Oops")>Click me</button>';
  const expectedOutput = '<button>Click me</button>';

  VueSanitizeDirectiveSSR(vnode, { modifiers: {}, value: dirtyInput });

  expect(vnode.data.domProps.innerHTML).toBe(expectedOutput);
});

