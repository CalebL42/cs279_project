import sanitizeHtml from 'sanitize-html';

import { VueSanitizeDirectiveSSR } from './fuzzed_packages/vue-sanitize-directive/package/src/index.js';

test('VueSanitizeDirectiveSSR: Script tag retention', () => {
  const vnode = { data: { domProps: {} } };
  const value = '<sCRipT>alert(1)</sCRipT>';
  const modifiers = { basic: true };

  VueSanitizeDirectiveSSR(vnode, { modifiers, value });
  expect(vnode.data.domProps.innerHTML).not.toContain('<script');
});

test('VueSanitizeDirectiveSSR: Malicious CSS bypass', () => {
  const vnode = { data: { domProps: {} } };
  const value = '<div style="width: expression(alert(1));">Test</div>';
  const modifiers = { inline: true };

  VueSanitizeDirectiveSSR(vnode, { modifiers, value });
  expect(vnode.data.domProps.innerHTML).not.toContain('expression');
});

test('VueSanitizeDirectiveSSR: Incomplete HTML entity bypass', () => {
  const vnode = { data: { domProps: {} } };
  const value = 'Unclosed <title>alert(1)';
  const modifiers = { basic: true };

  VueSanitizeDirectiveSSR(vnode, { modifiers, value });
  expect(vnode.data.domProps.innerHTML).not.toContain('<title>');
});

