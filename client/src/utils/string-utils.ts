export const isStringEmpty = (string: string | null | undefined) => (string !== null && string !== undefined)
    && string.trim().length !== 0;
