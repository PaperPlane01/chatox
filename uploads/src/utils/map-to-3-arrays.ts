export const mapTo3Arrays = <Source, Target1, Target2, Target3>(
    source: Source[],
    mapFunction1: (item: Source, index: number, array: Source[]) => Target1,
    mapFunction2: (item: Source, index: number, array: Source[]) => Target2,
    mapFunction3: (item: Source, index: number, array: Source[]) => Target3
): [Target1[], Target2[], Target3[]] => {
    const target1: Target1[] = [];
    const target2: Target2[] = [];
    const target3: Target3[] = [];

    source.forEach((item, index) => {
        target1.push(mapFunction1(item, index, source));
        target2.push(mapFunction2(item, index, source));
        target3.push(mapFunction3(item, index, source));
    });

    return [target1, target2, target3];
}