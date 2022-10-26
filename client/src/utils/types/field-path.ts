export type FieldValues = Record<string, any>;

export type Primitive =
    | null
    | undefined
    | string
    | number
    | boolean
    | symbol
    | bigint;

type IsTuple<T extends ReadonlyArray<any>> = number extends T['length']
    ? false
    : true;
type TupleKey<T extends ReadonlyArray<any>> = Exclude<keyof T, keyof any[]>;
type ArrayKey = number;

type PathImpl<K extends string | number, V> = V extends Primitive
    ? `${K}`
    : `${K}` | `${K}.${Path<V>}`;

export type Path<T> = T extends ReadonlyArray<infer V>
    ? IsTuple<T> extends true
        ? {
            [K in TupleKey<T>]-?: PathImpl<K & string, T[K]>;
        }[TupleKey<T>]
        : PathImpl<ArrayKey, V>
    : {
        [K in keyof T]-?: PathImpl<K & string, T[K]>;
    }[keyof T];

export type FieldPath<TFieldValues extends FieldValues> = Path<TFieldValues>;

type ArrayPathImpl<K extends string | number, V> = V extends Primitive
    ? never
    : V extends ReadonlyArray<infer U>
        ? U extends Primitive
            ? never
            : `${K}` | `${K}.${ArrayPath<V>}`
        : `${K}.${ArrayPath<V>}`;

export type ArrayPath<T> = T extends ReadonlyArray<infer V>
    ? IsTuple<T> extends true
        ? {
            [K in TupleKey<T>]-?: ArrayPathImpl<K & string, T[K]>;
        }[TupleKey<T>]
        : ArrayPathImpl<ArrayKey, V>
    : {
        [K in keyof T]-?: ArrayPathImpl<K & string, T[K]>;
    }[keyof T];

export type PathValue<T, P extends Path<T> | ArrayPath<T>> = T extends any
    ? P extends `${infer K}.${infer R}`
        ? K extends keyof T
            ? R extends Path<T[K]>
                ? PathValue<T[K], R>
                : never
            : K extends `${ArrayKey}`
                ? T extends ReadonlyArray<infer V>
                    ? PathValue<V, R & Path<V>>
                    : never
                : never
        : P extends keyof T
            ? T[P]
            : P extends `${ArrayKey}`
                ? T extends ReadonlyArray<infer V>
                    ? V
                    : never
                : never
    : never;

export type FieldPathValue<
    TFieldValues extends FieldValues,
    TFieldPath extends FieldPath<TFieldValues>,
    > = PathValue<TFieldValues, TFieldPath>;

export type FieldPathValues<
    TFieldValues extends FieldValues,
    TPath extends FieldPath<TFieldValues>[] | readonly FieldPath<TFieldValues>[],
    > = {} & {
    [K in keyof TPath]: FieldPathValue<
        TFieldValues,
        TPath[K] & FieldPath<TFieldValues>
        >;
};