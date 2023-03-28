export const mapTo2Arrays = <Source, Target1, Target2>(
    source: Source[],
    mapFunction1: (item: Source, index: number, array: Source[]) => Target1,
    mapFunction2: (item: Source, index: number, array: Source[]) => Target2
): [Target1[], Target2[]] => {
    const target1: Target1[] = [];
    const target2: Target2[] = [];

    source.forEach((item, index) => {
        target1.push(mapFunction1(item, index, source));
        target2.push(mapFunction2(item, index, source));
    });

    return [target1, target2];
}