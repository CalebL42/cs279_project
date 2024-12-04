import sanitizeHtml from 'sanitize-html';

import { directive } from './fuzzed_packages/vue-sanitize-directive/package/src/index.js';

test('serverSideSanitization should strip all tags but fails on whitespace variance', () => {
  const input = ` <div> Test <script>alert('xss')</script> </div>`;
  const result = directive.getSSRProps({ modifiers: { strip: true }, value: input });
  expect(result.innerHTML).toBe('');
});

test('serverSideSanitization should not allow embedded scripts but fails', () => {
  const input = `<image src="invalid" onerror="alert('xss')">`;
  const result = directive.getSSRProps({ modifiers: { basic: true }, value: input });
  expect(result.innerHTML).toBe('');
});

test('serverSideSanitization should prevent escaping sequences but fails', () => {
  const input = `<img src=noimg.jpg onerror=&#x0061;&#x006C;&#x0065;&#x0072;&#x0074;(document.cookie)>`;
  const result = directive.getSSRProps({ modifiers: { inline: true }, value: input });
  expect(result.innerHTML).toBe('<img src="noimg.jpg">');
});

