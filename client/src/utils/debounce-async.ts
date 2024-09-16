import {debounce} from "lodash";

export const debounceAsync = <
	F extends (...args: any[]) => Promise<any>
>(func: F, wait?: number) => {
	const debounced = debounce((resolve, reject, args: Parameters<F>) => {
		func(...args).then(resolve).catch(reject);
	}, wait);
	return (...args: Parameters<F>): ReturnType<F> =>
		new Promise((resolve, reject) => {
			debounced(resolve, reject, args);
		}) as ReturnType<F>;
};
