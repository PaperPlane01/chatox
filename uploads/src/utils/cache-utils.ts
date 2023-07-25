const FILE_INFO_PREFIX = "fileInfo";

export const generateFileInfoCacheKey = (uploadName: string, size?: number): string => {
    if (size) {
        return `${FILE_INFO_PREFIX}_${uploadName}_${size}`;
    } else {
        return `${FILE_INFO_PREFIX}_${uploadName}`;
    }
};