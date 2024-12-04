import sanitizeHtml from 'sanitize-html';

import { directive, VueSanitizeDirectiveSSR } from './fuzzed_packages/vue-sanitize-directive/package/src/index.js';

test('VueSanitizeDirectiveSSR should strip all scripts but fails on nested SVG', () => {
  const vnode = { data: { domProps: {} } };
  const input = `<svg><desc>irrelevant</desc><script>alert('XSS')</script></svg>`;
  VueSanitizeDirectiveSSR(vnode, { modifiers: { strip: true }, value: input });
  expect(vnode.data.domProps.innerHTML).toBe('<svg><desc>irrelevant</desc></svg>');
});

test('VueSanitizeDirectiveSSR should avoid malicious event handlers but fails', () => {
  const vnode = { data: { domProps: {} } };
  const input = `<div onclick=alert('xss')>Click me</div>`;
  VueSanitizeDirectiveSSR(vnode, { modifiers: { basic: true }, value: input });
  expect(vnode.data.domProps.innerHTML).toBe('<div>Click me</div>');
});

test('VueSanitizeDirectiveSSR should ignore XSS through CSS properties but fails', () => {
  const vnode = { data: { domProps: {} } };
  const input = `<style>body{background:url(javascript:alert('XSS'))}</style>`;
  VueSanitizeDirectiveSSR(vnode, { modifiers: { inline: true }, value: input });
  expect(vnode.data.domProps.innerHTML).toBe('');
});

