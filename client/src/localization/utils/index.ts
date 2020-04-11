const REGEXP = /{([^{]+)}/g;

export const replacePlaceholder = (string: string, bindings: any): string => {
    return string.replace(REGEXP, (_, key) => {
        return (key = bindings[key]) ? key : "";
    });
};
