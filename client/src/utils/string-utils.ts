export const isStringEmpty = (string: string | null | undefined) => (string === null || string === undefined) || string.trim().length === 0;

export const trimString = (string: string, targetLength: number): string => {
    if (string.length <= targetLength) {
        return string;
    }

    return string.substr(0, targetLength - 3) + "...";
};
