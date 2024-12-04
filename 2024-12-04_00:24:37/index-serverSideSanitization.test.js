import sanitizeHtml from 'sanitize-html';

import { serverSideSanitization } from './fuzzed_packages/vue-sanitize-directive/package/src/index.js';

test('serverSideSanitization: Bypass inline script attack', () => {
  const value = '<script type="text/javascript">alert(`attack`)</script>';
  const modifiers = { inline: true };

  const { innerHTML } = serverSideSanitization({ modifiers, value });
  expect(innerHTML).toBe('');
});

test('serverSideSanitization: Unfiltered URL schema bypass', () => {
  const value = '<a href="javascript:alert(1)">Click me</a>'; // Should be sanitized
  const modifiers = { basic: true };

  const { innerHTML } = serverSideSanitization({ modifiers, value });
  expect(innerHTML).not.toContain('javascript');
});

test('serverSideSanitization: Dangerous attribute bypass', () => {
  const value = '<span style="background-image: url(javascript:alert(1));">Test</span>';
  const modifiers = { inline: true };

  const { innerHTML } = serverSideSanitization({ modifiers, value });
  expect(innerHTML).not.toContain('background-image');
});

