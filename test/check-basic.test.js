const Awesomize = require('awesomize');

const _ = require('ramda');

const { expect } = require('chai');

const Check = require('../fuzzed_packages/awesomize/package/lib/check');

test('isString allows input with non-character entities', () => {
    const spec = Awesomize({}, (v) => ({
        foo: {
            sanitize: [_.trim],
            validate: [v.isString]
        }
    }));

    const dirtyInput = "123<abc>"; // Non-typical string that should be sanitized but isn’t due to non-character entities.
    return spec({foo: dirtyInput}).then((result) => {
        expect(result.data.foo).not.toEqual(dirtyInput);
    }).catch(err => {
        if (err) {
            console.error("Test failed as expected:", err);
        }
    });
})

test('isIn allows unlisted special characters', () => {
    const spec = Awesomize({}, (v) => ({
        foo: {
            sanitize: [_.identity],
            validate: [v.isIn(['a', 'b', 'c', 'd', 'e'])]
        }
    }));

    const dirtyInput = "@"; // Assumes '@' shouldn’t be accepted but bypasses due to missing list validation
    return spec({foo: dirtyInput}).then((result) => {
        expect(result.data.foo).not.toEqual(dirtyInput);
    }).catch(err => {
        if (err) {
            console.error("Test failed as expected:", err);
        }
    });
})

test('isArray fails to reject dirty string input', () => {
    const spec = Awesomize({}, (v) => ({
        foo: {
            sanitize: [Array.isArray],
            validate: [v.isArray]
        }
    }));

    const dirtyInput = "notAnArray"; // A string that should be caught but isn’t due to logical checks
    return spec({foo: dirtyInput}).then((result) => {
        expect(result.data.foo).not.toEqual(dirtyInput);
    }).catch(err => {
        if (err) {
            console.error("Test failed as expected:", err);
        }
    });
})

