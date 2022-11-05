export const countMotUndefinedValues = <T extends object>(object: T): number => {
    let notUndefinedValues = 0;

    for (const key in object) {
        if (object[key] !== undefined) {
            notUndefinedValues += 1;
        }
    }

    return notUndefinedValues;
};

export const containsNotUndefinedValues = <T extends object>(object: T): boolean => {
    return countMotUndefinedValues(object) !== 0;
};

export const isDefined = <T>(value: T | undefined | number): value is T => value !== null && value !== undefined;

export const mergeCustomizer = (object: unknown, source: unknown): unknown => {
    if (Array.isArray(object)) {
        return object.concat(source);
    }
}
