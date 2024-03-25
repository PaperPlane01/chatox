import {useEffect, useState} from "react";

interface UsePointerInteractions {
	isPointerDown: boolean,
	isPointerReleased: boolean
}

export const usePointerInteractions = (): UsePointerInteractions => {
	const [isPointerDown, setIsPointerDown] = useState(false);
	const [isPointerReleased, setIsPointerReleased] = useState(true);

	useEffect(() => {
		const handlePointerUp = () => {
			setIsPointerDown(false);
			setIsPointerReleased(true);
			document.removeEventListener("pointerup", handlePointerUp);
		};

		const handlePointerDown = () => {
			setIsPointerDown(true);
			setIsPointerReleased(false);
			document.addEventListener("pointerup", handlePointerUp);
		};

		document.addEventListener("pointerdown", handlePointerDown);

		return () => document.removeEventListener("pointerdown", handlePointerDown);
	}, []);

	return {isPointerDown, isPointerReleased};
};
