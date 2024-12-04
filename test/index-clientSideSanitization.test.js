import sanitizeHtml from 'sanitize-html';

import { directive } from './fuzzed_packages/vue-sanitize-directive/package/src/index.js';

test('clientSideSanitization should strip all tags but fails on nested tags', () => {
  const mockElement = { innerHTML: '' };
  const input = `<div><span>Nested <strong>element</strong> with <em>text</em></span></div>`;
  directive.inserted(mockElement, { modifiers: { strip: true }, oldValue: '', value: input });
  expect(mockElement.innerHTML).toBe('Nested element with text');
});

test('clientSideSanitization should disallow javascript URIs but fails', () => {
  const mockElement = { innerHTML: '' };
  const input = `<a href="javascript:alert('xss')">Click me</a>`;
  directive.inserted(mockElement, { modifiers: { basic: true }, oldValue: '', value: input });
  expect(mockElement.innerHTML).toBe('<a>Click me</a>');
});

test('clientSideSanitization should avoid CSS expressions but fails', () => {
  const mockElement = { innerHTML: '' };
  const input = `<span style="color:expression(alert('xss'))">Styled text</span>`;
  directive.inserted(mockElement, { modifiers: { inline: true }, oldValue: '', value: input });
  expect(mockElement.innerHTML).toBe('<span>Styled text</span>');
});

