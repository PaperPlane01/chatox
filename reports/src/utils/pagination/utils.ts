export const calculateOffset = (page: number, pageSize: number) => {
    let offset = (page - 1) * pageSize;

    if (offset < 0) {
        offset = 0;
    }

    return offset;
};

export const getValidPage = (page?: string | number, fallback: number = 1, startFromZero: boolean = false): number => {
    let returnedPage = Number(page);

    if (startFromZero) {
        if (isNaN(returnedPage) || returnedPage < 0) {
            returnedPage = fallback;
        }
    } else {
        if (isNaN(returnedPage) || returnedPage < 1) {
            returnedPage = fallback;
        }
    }

    return returnedPage;
};

export const getValidPageSize = (pageSize?: string | number, fallback: number = 50): number => {
    let returnedPageSize = Number(pageSize);

    if (isNaN(returnedPageSize) || returnedPageSize < 1) {
        returnedPageSize = fallback
    }

    return returnedPageSize;
};
