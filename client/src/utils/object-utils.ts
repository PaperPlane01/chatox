export const countMotUndefinedValues = <T extends object>(object: T): number => {
    let notUndefinedValues = 0;

    for (const key in object) {
        if (object[key] !== undefined) {
            notUndefinedValues += 1;
        }
    }

    return notUndefinedValues;
};
