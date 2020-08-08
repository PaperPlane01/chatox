export const isStringEmpty = (string: string | null | undefined, trimString: boolean = false) => {
    if (string === null || string === undefined) {
        return true;
    }

    return trimString ? string.trim().length === 0 : string.length === 0;
};

export const trimString = (string: string, targetLength: number): string => {
    if (string.length <= targetLength) {
        return string;
    }

    return string.substr(0, targetLength - 3) + "...";
};
