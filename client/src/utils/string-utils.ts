import {isDefined} from "./object-utils";

export const isStringEmpty = (string: string | null | undefined, trimString: boolean = false) => {
    if (!isDefined(string)) {
        return true;
    }

    return trimString ? string!.trim().length === 0 : string!.length === 0;
};

export const trimString = (string: string, targetLength: number): string => {
    if (string.length <= targetLength) {
        return string;
    }

    return string.substring(0, targetLength - 3) + "...";
};

export const capitalize = (text: string): string => text.charAt(0).toUpperCase() + text.slice(1);
