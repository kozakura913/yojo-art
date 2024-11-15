type Predicate<T> = (x: T) => boolean;
export declare function countIf<T>(f: Predicate<T>, xs: T[]): number;
export declare function count<T>(a: T, xs: T[]): number;
export declare function concat<T>(xss: T[][]): T[];
export declare function intersperse<T>(sep: T, xs: T[]): T[];
export declare function erase<T>(a: T, xs: T[]): T[];
export declare function difference<T>(xs: T[], ys: T[]): T[];
export declare function unique<T>(xs: T[]): T[];
export declare function uniqueBy<TValue, TKey>(values: TValue[], keySelector: (value: TValue) => TKey): TValue[];
export declare function sum(xs: number[]): number;
export declare function maximum(xs: number[]): number;
export declare function lessThan(xs: number[], ys: number[]): boolean;
export declare function takeWhile<T>(f: Predicate<T>, xs: T[]): T[];
export declare function cumulativeSum(xs: number[]): number[];
export declare function toArray<T>(x: T | T[] | undefined): T[];
export declare function toSingle<T>(x: T | T[] | undefined): T | undefined;
export {};
//# sourceMappingURL=array.d.ts.map