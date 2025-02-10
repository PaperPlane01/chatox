export const emptyArray = <T>(): T[] => [];

export const swapItems = <T>(array: T[], index1: number, index2: number): void => {
	[array[index1], array[index2]] = [array[index2], array[index1]];
};
