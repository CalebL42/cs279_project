import sanitizeHtml from 'sanitize-html';

import { clientSideSanitization } from './fuzzed_packages/vue-sanitize-directive/package/src/index.js';

test('clientSideSanitization: Bypass basic tag stripping', () => { 
  const el = { innerHTML: '' };
  const value = '<img src=x onerror=alert(1)>'; // Should be stripped or escaped
  const modifiers = { basic: true };
 
  clientSideSanitization(el, { modifiers, oldValue: '', value });
  expect(el.innerHTML).not.toContain('<img');
});

test('clientSideSanitization: Nested script bypass', () => { 
  const el = { innerHTML: '' };
  const value = '<div><script>alert(1)</script></div>';
  const modifiers = { basic: true };
 
  clientSideSanitization(el, { modifiers, oldValue: '', value });
  expect(el.innerHTML).not.toContain('<script');
});

test('clientSideSanitization: Encoding attack', () => { 
  const el = { innerHTML: '' };
  const value = '<svg/onload=confirm&lpar;1&rpar;>';
  const modifiers = { basic: true };
 
  clientSideSanitization(el, { modifiers, oldValue: '', value });
  expect(el.innerHTML).not.toContain('<svg');
});

