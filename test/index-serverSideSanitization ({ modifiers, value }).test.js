const { serverSideSanitization } = require('./fuzzed_packages/vue-sanitize-directive/package/src/index.js');

test('serverSideSanitization should not allow <iframe>', () => {
  const dirtyInput = '<iframe src="javascript:alert(1)"></iframe>';
  const expectedOutput = '&lt;iframe src="javascript:alert(1)"&gt;&lt;/iframe&gt;';

  const result = serverSideSanitization({ modifiers: {}, value: dirtyInput });

  expect(result.innerHTML).toBe(expectedOutput);
});

test('serverSideSanitization should handle <script> inside SVG', () => {
  const dirtyInput = '<svg/onload=alert(/XSS/)>'';
  const expectedOutput = '&lt;svg/onload=alert(/XSS/)&gt;';

  const result = serverSideSanitization({ modifiers: { basic: true }, value: dirtyInput });
  
  expect(result.innerHTML).toBe(expectedOutput);
});

test('serverSideSanitization with nested malicious payload', () => {
  const dirtyInput = '<div><p><span onclick=alert(1)>Test</span></p></div>';
  const expectedOutput = '<div><p><span>Test</span></p></div>';

  const result = serverSideSanitization({ modifiers: {}, value: dirtyInput });

  expect(result.innerHTML).toBe(expectedOutput);
});

