export const mapAsync = async <Source, Target>(
    sourceArray: Source[],
    callback: (element: Source, index: number, array: Source[]) => Promise<Target>
): Promise<Target[]> => {
    const result: Target[] = [];

    for (let index = 0; index < sourceArray.length; index++) {
        const resultItem = await callback(sourceArray[index], index, sourceArray);
        result.push(resultItem);
    }

    return result;
};
