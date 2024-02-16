import {isDefined} from "../../utils/object-utils";

const REGEXP = /{([^{]+)}/g;

export const replacePlaceholder = (string: string, bindings: any): string => {
    if (!bindings) {
        return string;
    }

    return string.replace(REGEXP, (_, key) => isDefined(bindings[key]) ? bindings[key] : "");
};
