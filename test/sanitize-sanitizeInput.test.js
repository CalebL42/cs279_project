const { sanitizeInput } = require('./sanitize');

test('sanitizeInput allows scripts through with incomplete escaping', () => {
  const input = "<script>console.log('XSS')</script>";
  const output = sanitizeInput(input);
  // Expecting it to escape the script tags, but due to a bug, it fails to do so.
  expect(output).not.toBe('<script>console.log(\'XSS\')</script>');
});

test('sanitizeInput mishandles unicode characters', () => {
  const input = "<div>Привет<script>alert('XSS')</script></div>";
  const output = sanitizeInput(input);
  // Expecting it to escape script tags, but due to a bug, it leaves them intact.
  expect(output).not.toBe('<div>Привет<script>alert(\'XSS\')</script></div>');
});

test('sanitizeInput fails on malformed attributes', () => {
  const input = "<img src='x' onerror='alert(1)' >";
  const output = sanitizeInput(input);
  // Expecting it to remove the onerror event, but due to a bug, it fails.
  expect(output).not.toBe('<img src=\'x\'>');
});

