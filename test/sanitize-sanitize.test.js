import sanitize, { OR } from 'sanitize-against';

test('Bypass with Optional and Default Values', () => {
    const pattern = {
        'username': String,
        'profile': {
            'age?': Number,
            'role': 'user'  // Default value
        }
    };
    const against = sanitize(pattern);
    const input = {
        username: 'malicious_user',
        profile: { role: undefined }  // Intentionally setting to invoke defaults
    };
    const result = against(input);
    // Expect 'role' to be defaulted to 'user', but check if raw data passed
    expect(result.profile.role).not.toBe('user');  // this should fail if result is user or unsanitized
});

test('Improper OR Handling for String Numbers', () => {
    const pattern = new OR(Number, String);
    const against = sanitize(pattern);
    const input = "123abc";  // String that looks like number but should fail
    const result = against(input);
    expect(result).toThrow();  // Should throw but passes
});

test('Prototype Pollution Exploit', () => {
    const pattern = {
        name: String,
        details: {
            address: String
        }
    };
    const against = sanitize(pattern);
    const input = {
        name: 'John Doe',
        '__proto__': { admin: true },  // Prototype pollution attempt
        details: {
            address: '123 Unknown St'
        }
    };
    const result = against(input);
    // Check if prototype pollution is reverted
    expect({}.admin).toBe(undefined);  // Should be undefined but polluted
});

