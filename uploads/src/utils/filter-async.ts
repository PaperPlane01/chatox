import {forEachAsync} from "./for-each-async";

export const filterAsync = async <Source>(
    array: Source[],
    filterFunction: (item: Source, index: number, array: Source[]) => Promise<boolean>
): Promise<Source[]> => {
    const result: Source[] = [];

    await forEachAsync(
        array,
        async (item, index, array) => {
            const add = await filterFunction(item, index, array);

            if (add) {
                result.push(item);
            }
        }
    );

    return result;
}