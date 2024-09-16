import {union} from "lodash";

export const countNotUndefinedValues = <T extends object>(object: T, stopAfterFirst: boolean = false): number => {
    let notUndefinedValues = 0;

    for (const key in object) {
        if (object[key] !== undefined) {
            notUndefinedValues += 1;

            if (stopAfterFirst) {
                break;
            }
        }
    }

    return notUndefinedValues;
};

export const containsNotUndefinedValues = <T extends object>(object: T): boolean => {
    return countNotUndefinedValues(object, true) !== 0;
};

export const isDefined = <T>(value: T | undefined | null): value is T => value !== null && value !== undefined;

export const isPromise = <T>(value: any): value is Promise<T> => Boolean(value && typeof value.then === "function");

export const mergeCustomizer = (object: unknown, source: unknown): unknown => {
    if (Array.isArray(object)) {
        return union(object, source as Array<any>);
    }
}

type OptionalFields<T> = {
    [Key in keyof T]: T[Key] | undefined
}

type SameKeys<T> = {
    [Key in keyof T]: any
}

export const createWithUndefinedValues = <Target, Source extends SameKeys<Target>>(source: Source): OptionalFields<Target> => {
    const result = {} as OptionalFields<Target>;
    Object.keys(source).forEach(key => result[key as keyof Target] = undefined);
    return result;
}