export declare function polyfill(): Promise<void>;
declare global {
    var String: {
        stringConstructorIdentifier19823718723: true;
    } & StringConstructor;
    var Number: {
        numberConstructorIdentifier19823718723: true;
    } & NumberConstructor;
    var Boolean: {
        booleanConstructorIdentifier19823718723: true;
    } & BooleanConstructor;
    var Object: {
        ObjectConstructorIdentifier19823718723: true;
    } & ObjectConstructor;
    var Function: {
        FunctionConstructorIdentifier19823718723: true;
    } & FunctionConstructor;
}
export declare function isConstructor(f: Function): boolean;
type PrimWithDefault = string | number | boolean;
type Prim<InputParam = unknown> = typeof String | typeof Number | typeof Boolean | ((input: InputParam) => unknown) | Matcher | typeof Object | {
    new (...a: any[]): unknown;
} | typeof Function | PrimWithDefault;
type Obj = {
    [key: string]: Prim | Obj;
};
type Pattern = Prim | Obj;
type InpPrim = string | number | boolean;
type InpObj = {
    [key: string]: InpPrim | InpObj;
};
type Inp = InpPrim | InpObj;
declare const fromInstanceSym: unique symbol;
declare abstract class Matcher {
    protected init?(): void;
    protected abstract matches(input: unknown): unknown;
    protected abstract [fromInstanceSym]: string;
}
type PossibleKeyPatterns = Pattern & (((key: string) => string) | Combinator | CONST<any> | typeof String | AND<typeof String, typeof Number>);
export declare class OBJECT<ValuePattern extends Pattern, KeyPattern extends PossibleKeyPatterns, Deep extends boolean = false> extends Matcher {
    private valuePattern;
    protected get [fromInstanceSym](): string;
    private saniValue;
    private saniKey;
    private soft;
    private keyPattern;
    private deep;
    constructor(valuePattern: ValuePattern, soft: boolean, deep?: Deep);
    constructor(valuePattern?: ValuePattern, keyPattern?: KeyPattern, soft?: boolean, deep?: Deep);
    protected init(): void;
    protected matches(input: unknown): unknown;
}
export declare class AWAITED<Pat extends Pattern> extends Matcher {
    private _pattern;
    protected get [fromInstanceSym](): string;
    sani: Function;
    constructor(_pattern: Pat);
    protected init(): void;
    private get pattern();
    protected matches(input: unknown): unknown;
}
export declare class CONST<MyPattern extends string | number | boolean> extends Matcher {
    private constVal;
    protected get [fromInstanceSym](): string;
    constructor(constVal: MyPattern);
    protected matches(input: unknown): unknown;
}
declare abstract class Combinator extends Matcher {
    protected patterns: Pattern[];
    protected sanis: Function[];
    protected init(): void;
}
declare abstract class BooleanCombinator extends Combinator {
    constructor(...inputs: any[]);
}
type SanitizeTuple<Tuple extends (Pattern | unknown)[], Output extends boolean> = {
    [key in keyof Tuple]: Tuple[key] extends Pattern ? Sanitized<Tuple[key], Output> : unknown;
};
type FilterOutAnyTuple<Tuple extends Pattern[]> = {
    [key in keyof Tuple]: IsAny<Tuple[key]> extends true ? unknown : Tuple[key];
};
type FMay<As extends Pattern[], Output extends boolean = true> = ((f1: TupleToIntersection<SanitizeTuple<FilterOutAnyTuple<As>, Output>>) => any) | NOT<(a: TupleToIntersection<SanitizeTuple<FilterOutAnyTuple<As>, Output>>) => unknown>;
type IsAny<T> = 0 extends (1 & T) ? true : false;
export declare class AND<A1 extends Pattern, A2 extends Pattern = any, A3 extends Pattern = any, A4 extends Pattern = any, A5 extends Pattern = any, A6 extends Pattern = any, A7 extends Pattern = any, A8 extends Pattern = any, A9 extends Pattern = any, A10 extends Pattern = any, R extends FilterOutAnyTuple<[A1, A2, A3, A4, A5, A6, A7, A8, A9, A10]> = FilterOutAnyTuple<[A1, A2, A3, A4, A5, A6, A7, A8, A9, A10]>> extends BooleanCombinator {
    private isAnd;
    protected get [fromInstanceSym](): string;
    constructor(f1: A1, f2?: A2 | FMay<[A1]>, f3?: A3 | FMay<[A1, A2]>, f4?: A4 | FMay<[A1, A2, A3]>, f5?: A5 | FMay<[A1, A2, A3, A4]>, f6?: A6 | FMay<[A1, A2, A3, A4, A5]>, f7?: A7 | FMay<[A1, A2, A3, A4, A5, A6]>, f8?: A8 | FMay<[A1, A2, A3, A4, A5, A6, A7]>, f9?: A9 | FMay<[A1, A2, A3, A4, A5, A6, A7, A8]>, f10?: A10 | FMay<[A1, A2, A3, A4, A5, A6, A7, A8, A9]>);
    protected matches(input: unknown): any;
}
export declare class OR<Arg extends Pattern[], Pat extends Arg[number] = Arg[number]> extends BooleanCombinator {
    private isOr;
    protected get [fromInstanceSym](): string;
    private awaitedSanis;
    private nonAwaitedSanis;
    constructor(...ar: Arg);
    protected init(): void;
    protected matches(input: unknown): any;
    addPattern(pat: Pattern): void;
}
export declare class NOT<FunctionHint extends ((a: unknown) => unknown), Arg extends Pattern = FunctionHint> extends Combinator {
    private isNot;
    protected get [fromInstanceSym](): string;
    constructor(ar: Arg);
    constructor(f1: FunctionHint & Arg);
    protected matches(input: unknown): any;
}
declare function sanitize<Pat extends Pattern>(pattern: Pat, errorMsg?: string | ((a: any) => string)): (input: Sanitized<Pat, false>, errorMsg?: string | ((a: any) => string)) => Sanitized<Pat, true>;
type EscapeAndFilterQuestionmarkKey<S extends string> = S extends `${infer T}?` ? T extends `${infer U}?` ? `${EscapeAndFilterQuestionmarkKey<U>}?` : T : never;
type EscapeQuestionmarkKey<S extends string> = S extends `${infer T}?` ? T extends `${infer U}?` ? `${EscapeQuestionmarkKey<U>}?` : T : S;
type PartiallyOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
type EscapeAndFilterQuestionmarkProps<Ob> = {
    [key in keyof Ob as (key extends string ? EscapeAndFilterQuestionmarkKey<key> : key)]: any;
};
type EscapeQuestionmarkProps<Ob> = {
    [key in keyof Ob as key extends string ? EscapeQuestionmarkKey<key> : key]: Ob[key];
};
type DeepOBJECT<ValArg extends Pattern, KeyArg extends PossibleKeyPatterns, Output extends boolean> = {
    [key in Sanitized<KeyArg, Output>]: Sanitized<ValArg> | DeepOBJECT<ValArg, KeyArg, Output>;
};
type ParseIfCombinator<Val extends Prim, Output extends boolean> = Val extends AND<infer _0, infer _1, infer _2, infer _3, infer _4, infer _5, infer _6, infer _7, infer _8, infer _9, infer Args> ? TupleToIntersection<SanitizeTuple<Args, Output>> : Val extends OR<infer Arg> ? AWAITED<any> extends Arg[number] ? Output extends true ? Promise<Awaited<Sanitized<Arg[number], Output>>> : Sanitized<Arg[number], Output> : Sanitized<Arg[number], Output> : Val extends NOT<infer _, infer Arg> ? Exclude<Inp, Sanitized<Arg, Output>> : Val extends CONST<infer Arg> ? Arg : Val extends AWAITED<infer Arg> ? Promise<Sanitized<Arg, Output> extends Promise<any> ? Awaited<Sanitized<Arg, Output>> : Sanitized<Arg, Output>> : Val extends OBJECT<infer ValArg, infer KeyArg, infer Deep> ? Deep extends false ? {
    [key in Sanitized<KeyArg, Output>]: Sanitized<ValArg>;
} : DeepOBJECT<ValArg, KeyArg, Output> : Val;
type ParseVal<Val extends Prim, Output extends boolean> = Val extends typeof Number ? number : Val extends typeof String ? string : Val extends typeof Boolean ? boolean : Val extends Matcher ? ParseIfCombinator<Val, Output> : Val extends {
    new (...a: any[]): infer I;
} ? I : Val extends number ? number : Val extends string ? string : Val extends boolean ? boolean : Val extends ((a: infer Inp) => infer Out) ? Output extends true ? Out : Inp : Val;
type ParseValOb<Ob extends {
    [key in string]: Prim;
}, Output extends boolean> = RemovePropsByValue<{
    [key in keyof Ob]: Ob[key] extends PrimWithDefault ? never : ParseVal<Ob[key], Output>;
}, never> & RemovePropsByValue<{
    [key in keyof Ob]?: Ob[key] extends PrimWithDefault ? Ob[key] : never;
}, never>;
type SanitizeNotNestedOb<Ob extends {
    [key in string]: unknown;
}, Output extends boolean> = ParseValOb<PartiallyOptional<EscapeQuestionmarkProps<Ob>, keyof EscapeQuestionmarkProps<Ob> & keyof EscapeAndFilterQuestionmarkProps<Ob>>, Output>;
type SanitizeNestedOb<Ob extends {
    [key in string]: unknown;
}, Output extends boolean> = {
    [key in keyof SanitizeNotNestedOb<Ob, Output>]: SanitizeNotNestedOb<Ob, Output>[key] extends {
        [key in string]: unknown;
    } ? SanitizeNotNestedOb<SanitizeNotNestedOb<Ob, Output>[key], Output> : SanitizeNotNestedOb<Ob, Output>[key];
};
type Sanitized<Ob extends Pattern, Output extends boolean = true> = Ob extends Prim ? ParseVal<Ob, Output> : Ob extends {
    [key in string]: unknown;
} ? SanitizeNestedOb<Ob, Output> : never;
type RemovePropsByValue<T, V> = {
    [K in keyof T as T[K] extends V ? never : K]: T[K];
};
type TupleToIntersection<T extends any[]> = (T extends [infer Head, ...infer Rest] ? Head & TupleToIntersection<Rest> : unknown);
export default sanitize;
export declare function ensure<T>(validate: (input: T) => boolean, msg?: string | ((input: T) => string)): (input: T) => T;
export declare function matches<T>(pattern: (input: T) => unknown): (input: T) => boolean;
export declare const numberLikeStringPattern: AND<AND<OR<[StringConstructor, NumberConstructor], StringConstructor | NumberConstructor>, (input: string | number) => string | number, (input: string | number) => string | number, any, any, any, any, any, any, any, [OR<[StringConstructor, NumberConstructor], StringConstructor | NumberConstructor>, (input: string | number) => string | number, (input: string | number) => string | number, unknown, unknown, unknown, unknown, unknown, unknown, unknown]>, (s: string | number) => string, any, any, any, any, any, any, any, any, [AND<OR<[StringConstructor, NumberConstructor], StringConstructor | NumberConstructor>, (input: string | number) => string | number, (input: string | number) => string | number, any, any, any, any, any, any, any, [OR<[StringConstructor, NumberConstructor], StringConstructor | NumberConstructor>, (input: string | number) => string | number, (input: string | number) => string | number, unknown, unknown, unknown, unknown, unknown, unknown, unknown]>, (s: string | number) => string, unknown, unknown, unknown, unknown, unknown, unknown, unknown, unknown]>;
export declare const numberLikePattern: AND<AND<OR<[StringConstructor, NumberConstructor], StringConstructor | NumberConstructor>, (input: string | number) => string | number, (input: string | number) => string | number, any, any, any, any, any, any, any, [OR<[StringConstructor, NumberConstructor], StringConstructor | NumberConstructor>, (input: string | number) => string | number, (input: string | number) => string | number, unknown, unknown, unknown, unknown, unknown, unknown, unknown]>, (s: string | number) => number, any, any, any, any, any, any, any, any, [AND<OR<[StringConstructor, NumberConstructor], StringConstructor | NumberConstructor>, (input: string | number) => string | number, (input: string | number) => string | number, any, any, any, any, any, any, any, [OR<[StringConstructor, NumberConstructor], StringConstructor | NumberConstructor>, (input: string | number) => string | number, (input: string | number) => string | number, unknown, unknown, unknown, unknown, unknown, unknown, unknown]>, (s: string | number) => number, unknown, unknown, unknown, unknown, unknown, unknown, unknown, unknown]>;
export declare function stringStartsWith<S extends string>(s: S): (input: `${S}${string}`) => `${S}${string}`;
export declare function numericRange(lowerBound: number, upperBound: number): AND<NumberConstructor, (input: number) => number, any, any, any, any, any, any, any, any, [NumberConstructor, (input: number) => number, unknown, unknown, unknown, unknown, unknown, unknown, unknown, unknown]>;
export declare const nonEmptyStringPattern: AND<StringConstructor, (input: string) => string, any, any, any, any, any, any, any, any, [StringConstructor, (input: string) => string, unknown, unknown, unknown, unknown, unknown, unknown, unknown, unknown]>;
export declare const any: (a: unknown) => unknown;
export declare const unknown: (a: unknown) => unknown;
export declare function regex(regex: RegExp, msg?: string | ((a: string) => string)): (input: string) => string;
