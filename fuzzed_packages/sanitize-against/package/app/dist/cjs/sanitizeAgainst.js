'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

async function polyfill() {
    if (!Object.hasOwn) {
        const { shim } = await import('object.hasown');
        shim();
    }
}
function isConstructor(f) {
    return f.prototype !== undefined;
}
const fromInstanceSym = Symbol("fromInstance");
class Matcher {
}
class OBJECT extends Matcher {
    get [fromInstanceSym]() { return "OBJECT"; }
    constructor(valuePattern = (a => a), keyPattern_soft = (a => a), soft_deep = false, deep = false) {
        super();
        this.valuePattern = valuePattern;
        if (typeof keyPattern_soft === "boolean") {
            this.keyPattern = (a => a);
            this.soft = keyPattern_soft;
            this.deep = soft_deep;
        }
        else {
            this.keyPattern = keyPattern_soft;
            this.soft = soft_deep;
            this.deep = deep;
        }
        if (this.deep)
            this.valuePattern = new OR(this.valuePattern, this);
    }
    init() {
        this.init = () => { };
        this.saniKey = sanitizeRec(this.keyPattern);
        this.saniValue = sanitizeRec(this.valuePattern);
    }
    matches(input) {
        if (!(typeof input === "object" && input !== null && (Object.getPrototypeOf(input) === null || Object.getPrototypeOf(input).constructor === Object)))
            throw new Error("Input is not a plain object");
        if (knownInputObjects.has(input))
            return knownInputObjects.get(input);
        const out = {};
        knownInputObjects.set(input, out);
        for (const key in input) {
            if (out[key] !== undefined)
                continue; // prototype poisoning protection
            if (!this.soft) {
                out[this.saniKey(key)] = this.saniValue(input[key]);
            }
            else {
                try {
                    out[this.saniKey(key)] = this.saniValue(input[key]);
                }
                catch (e) { }
            }
        }
        return out;
    }
}
const isPromiseSani = sanitizeRec(Promise);
class AWAITED extends Matcher {
    get [fromInstanceSym]() { return "AWAITED"; }
    constructor(_pattern) {
        super();
        this._pattern = _pattern;
    }
    init() {
        this.sani = sanitizeRec(this.pattern);
    }
    get pattern() {
        return this._pattern instanceof AWAITED ? this._pattern.pattern : this._pattern;
    }
    matches(input) {
        isPromiseSani(input);
        const myKnownInputObjects = knownInputObjects;
        return input.then((input) => {
            knownInputObjects = myKnownInputObjects;
            const r = this.sani(input);
            knownInputObjects = null;
            return r;
        });
    }
}
class CONST extends Matcher {
    get [fromInstanceSym]() { return "CONST"; }
    constructor(constVal) {
        super();
        this.constVal = constVal;
    }
    matches(input) {
        if (input !== this.constVal)
            throw `Expected ${this.constVal}, got ${input}`;
        return input;
    }
}
class Combinator extends Matcher {
    init() {
        this.sanis = this.patterns.map((a) => sanitizeRec(a));
    }
}
class BooleanCombinator extends Combinator {
    constructor(...inputs) {
        super();
        this.patterns = inputs;
    }
}
class AND extends BooleanCombinator {
    get [fromInstanceSym]() { return "AND"; }
    // constructor(f1: A1, f2?: (FMay<[A1]>))
    constructor(...ar) {
        // constructor(...ar: AllPats & ([(never | Pattern) & A1, ((a: A1) => any)])) {
        super(...ar);
    }
    matches(input) {
        let curRet = input;
        for (const a of this.sanis) {
            curRet = a(curRet);
        }
        return curRet;
    }
}
class OR extends BooleanCombinator {
    get [fromInstanceSym]() { return "OR"; }
    constructor(...ar) {
        super(...ar);
    }
    init() {
        super.init();
        this.awaitedSanis = this.sanis.filter((a) => a[fromInstanceSym] !== undefined && a[fromInstanceSym][fromInstanceSym] === "AWAITED").map((a) => a[fromInstanceSym]);
        this.nonAwaitedSanis = this.sanis.filter((a) => !(a[fromInstanceSym] !== undefined && a[fromInstanceSym][fromInstanceSym] === "AWAITED"));
    }
    matches(input) {
        for (const a of this.nonAwaitedSanis) {
            try {
                const r = a(input);
                return this.awaitedSanis.length === 0 ? r : Promise.resolve(r);
            }
            catch (e) { }
        }
        if (this.awaitedSanis.length !== 0 && input instanceof Promise) {
            const myKnownInputObjects = knownInputObjects;
            return input.then((input) => {
                knownInputObjects = myKnownInputObjects;
                for (const a of this.awaitedSanis) {
                    try {
                        const r = a.sani(input);
                        knownInputObjects = null;
                        return r;
                    }
                    catch (e) { }
                }
                throw new Error("All awaited patterns failed");
            });
        }
        throw new Error("All patterns failed");
    }
    addPattern(pat) {
        this.patterns.push(pat);
    }
}
class NOT extends Combinator {
    get [fromInstanceSym]() { return "NOT"; }
    constructor(ar) {
        super();
        this.patterns = [ar];
        // this.ar = sanitize(ar)
    }
    matches(input) {
        let throws;
        try {
            this.sanis[0](input);
            throws = false;
        }
        catch (e) {
            throws = true;
        }
        if (throws)
            return input;
        else
            throw new Error("Matched even though it is negated.");
    }
}
function getNumberOfQuestionmarksAtTheEndOfString(str) {
    let i = str.length - 1;
    let count = 0;
    while (str[i] === "?") {
        count++;
        i--;
    }
    return count;
}
function againstPrimitiveDefault(type, defaultVal) {
    return (input) => {
        if (input === undefined || input === null)
            return defaultVal;
        else if (typeof input === type)
            return input;
        else
            throw new Error(`Input is not a ${type}`);
    };
}
function againstPrimitive(type) {
    return ensure(input => typeof input === type, `Input is not a ${type}`);
}
let knownPatternObjects;
let knownInputObjects;
function sanitize(pattern, errorMsg) {
    knownPatternObjects = new WeakMap();
    const out = sanitizeRec(pattern, errorMsg);
    knownPatternObjects = null;
    return (input, errorMsg) => {
        knownInputObjects = new WeakMap();
        const out2 = out(input, errorMsg);
        knownInputObjects = null;
        return out2;
    };
}
function sanitizeRec(pattern, globalErrorMsg) {
    let against;
    const type = typeof pattern;
    if (type === "string")
        against = againstPrimitiveDefault("string", pattern);
    else if (type === "number")
        against = againstPrimitiveDefault("number", pattern);
    else if (type === "boolean")
        against = againstPrimitiveDefault("boolean", pattern);
    else if (pattern === String)
        against = againstPrimitive("string");
    else if (pattern === Number)
        against = againstPrimitive("number");
    else if (pattern === Boolean)
        against = againstPrimitive("boolean");
    else if (pattern === Function)
        against = againstPrimitive("function");
    else if (pattern instanceof Matcher) {
        if (pattern.init)
            pattern.init();
        against = pattern.matches.bind(pattern);
        against[fromInstanceSym] = pattern;
    }
    else if (pattern === Object)
        against = (input) => {
            if (input instanceof Object || (typeof input === "object" && input !== null))
                return input;
            else
                throw new Error('Input is not instanceof object');
        };
    // It is important that this check is after all the constructor checks like if (input === Boolean)
    else if (pattern instanceof Function) {
        if (isConstructor(pattern))
            against = (input) => {
                if (!(input instanceof pattern))
                    throw new Error(`Input is not an instance of ${pattern.name}`);
                return input;
            };
        else
            against = pattern;
    }
    else if (typeof pattern === "object" && pattern !== null) {
        if (knownPatternObjects.has(pattern))
            return knownPatternObjects.get(pattern);
        const requiredPattern = new Map();
        const optionalPattern = new Map();
        for (const key in pattern) {
            const numberOfQuestionmarks = getNumberOfQuestionmarksAtTheEndOfString(key);
            let questionMarksToRemove = -Math.floor(numberOfQuestionmarks / 2);
            const isEvan = numberOfQuestionmarks % 2 === 0;
            if (!isEvan)
                questionMarksToRemove--;
            const keyWithoutQuestionmarks = questionMarksToRemove !== 0 ? key.slice(0, questionMarksToRemove) : key;
            (isEvan ? requiredPattern : optionalPattern).set(keyWithoutQuestionmarks, sanitizeRec(pattern[key]));
        }
        against = (input) => {
            if (input === null || input === undefined)
                input = {};
            else if (typeof input !== "object" || !(Object.getPrototypeOf(input) === null || Object.getPrototypeOf(input).constructor === Object))
                throw new Error('Input is not a plain object');
            if (knownInputObjects.has(input))
                return knownInputObjects.get(input);
            const out = Object.create(null);
            knownInputObjects.set(input, out);
            for (const [key, nestedAgainst] of requiredPattern) {
                const val = input[key] === undefined || Object.hasOwn(input, key) ? input[key] : undefined;
                try {
                    out[key] = nestedAgainst(val);
                }
                catch (e) {
                    e.message = `Regarding "${key}":\n${e.message}`;
                    throw e;
                }
            }
            for (const [key, nestedAgainst] of optionalPattern) {
                if (Object.hasOwn(input, key)) {
                    try {
                        out[key] = nestedAgainst(input[key]);
                    }
                    catch (e) {
                        e.message = `Regarding "${key}":\n${e.message}`;
                        throw e;
                    }
                }
            }
            // do this e.g. for equals functions. Some implementations (e.g. fast-equals) check constructor for equality
            Object.setPrototypeOf(out, Object.prototype);
            return out;
        };
        knownPatternObjects.set(pattern, against);
    }
    const againstWrapper = (input, errorMsg = globalErrorMsg) => {
        try {
            return against(input);
        }
        catch (e) {
            if (errorMsg !== undefined)
                e.message = `${errorMsg instanceof Function ? errorMsg(input) : errorMsg}\n\n${e.message}`;
            throw e;
        }
    };
    if (against[fromInstanceSym])
        againstWrapper[fromInstanceSym] = against[fromInstanceSym];
    return againstWrapper;
}
// boolean to throws
function ensure(validate, msg) {
    return (input) => {
        if (!validate(input))
            throw new Error(msg instanceof Function ? msg(input) : msg);
        return input;
    };
}
// throws to boolean
function matches(pattern) {
    return (input) => {
        try {
            pattern(input);
            return true;
        }
        catch (e) {
            return false;
        }
    };
}
const errorMsg = "Input must be of type number or a numberlike string, but is ";
const numberLikeCommon = new AND(new OR(String, Number), ensure((input) => input !== "", errorMsg + "an empty string"), ensure((input) => !isNaN(+input), (input) => errorMsg + "NaN (parsed from \"" + input + "\")"));
// this is separate because there is some information lost when converting to number and then back to string. E.g. "1.0" => 1 or "+1" => 1 or "1e1" => 1
const numberLikeStringPattern = new AND(numberLikeCommon, s => s + "");
const numberLikePattern = new AND(numberLikeCommon, s => +s);
function stringStartsWith(s) {
    return ensure((input) => input.startsWith(s), `Input must start with ${s}`);
}
function numericRange(lowerBound, upperBound) {
    if (lowerBound > upperBound)
        throw new Error("The lower bound must be less than or equal to the upper bound");
    return new AND(Number, ensure((input) => input >= lowerBound && input <= upperBound, `Input must be between ${lowerBound} and ${upperBound}`));
}
const nonEmptyStringPattern = new AND(String, ensure((input) => input !== "", "Input must be a non-empty string"));
const any = (a) => a;
const unknown = (a) => {
    if (a === undefined || a === null)
        throw new Error("Input must not be undefined or null");
    else
        return a;
};
function regex(regex, msg) {
    if (regex.flags.includes('g') || regex.flags.includes('y')) {
        console.warn(`Warning: The regex ${regex} has global ('g') or sticky ('y') flags set, which may cause stateful behavior.`);
    }
    return ensure((input) => {
        regex.lastIndex = 0; // Reset lastIndex to ensure stateless behavior
        return regex.test(input);
    }, msg ?? `Input must match the regex ${regex}`);
}

exports.AND = AND;
exports.AWAITED = AWAITED;
exports.CONST = CONST;
exports.NOT = NOT;
exports.OBJECT = OBJECT;
exports.OR = OR;
exports.any = any;
exports.default = sanitize;
exports.ensure = ensure;
exports.isConstructor = isConstructor;
exports.matches = matches;
exports.nonEmptyStringPattern = nonEmptyStringPattern;
exports.numberLikePattern = numberLikePattern;
exports.numberLikeStringPattern = numberLikeStringPattern;
exports.numericRange = numericRange;
exports.polyfill = polyfill;
exports.regex = regex;
exports.stringStartsWith = stringStartsWith;
exports.unknown = unknown;
