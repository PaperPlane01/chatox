export const emptyArray = <T>(): T[] => [];

export const swapItems = <T>(array: T[], index1: number, index2: number): void => {
	[array[index1], array[index2]] = [array[index2], array[index1]];
};

export const splitToChunks = <T>(array: T[], chunkSize: number): Array<Array<T>> => {
	const result: Array<Array<T>> = [];

	for (let currentIndex = 0; currentIndex < array.length; currentIndex+=chunkSize) {
		const currentChunk: T[] = [];
		const currentChunkEnd = result.length + chunkSize - 1 >= array.length
			? array.length - 1
			: result.length + chunkSize - 1;

		for (let innerIndex = currentIndex; innerIndex <= currentChunkEnd; innerIndex++) {
			currentChunk.push(array[innerIndex]);
		}

		result.push(currentChunk);
	}

	return result;
};

export const createTuple = <T1, T2>(first: T1, second: T2): readonly [T1, T2] => {
	return [first, second];
};
