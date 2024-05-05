import {useState} from "react";
import {isPromise} from "../object-utils";

type UseAsyncValue<T> = [boolean, T | undefined];

export const useAsyncValue = <T>(value: Promise<T> | T): UseAsyncValue<T> => {
	const valueIsPromise = isPromise(value);
	const [pending, setPending] = useState(valueIsPromise);
	const [result, setResult] = useState<T | undefined>(
		valueIsPromise ? undefined : value
	);

	if (valueIsPromise) {
		value.then(promiseResult => setResult(promiseResult))
			.finally(() => setPending(false));
	}

	return [pending, result];
};
