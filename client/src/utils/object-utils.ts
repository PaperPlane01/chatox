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
