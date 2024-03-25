import {CSSProperties, DependencyList, useLayoutEffect, useState} from "react";
import {isWindowScrollable} from "../../utils/dom-utils";

export const useMessagesListBottomStyles = (
	onSmallScreen: boolean,
	dependencies: DependencyList,
	recheckInTimeout: boolean = false
): CSSProperties => {
	const [style, setStyle] = useState<CSSProperties>({});

	const calculateStyles = (): CSSProperties => {
		if (!onSmallScreen) {
			return {};
		} else if (isWindowScrollable()) {
			return {position: "sticky"};
		} else {
			return {position: "absolute"};
		}
	};

	useLayoutEffect(() => {
		setStyle(calculateStyles());

		if (recheckInTimeout) {
			setTimeout(() => setStyle(calculateStyles()), 10);
		}
	}, dependencies);

	const handleResize = (): void => setStyle(calculateStyles());

	useLayoutEffect(() => {
		window.addEventListener("resize", handleResize);

		return () => window.removeEventListener("resize", handleResize);
	}, []);

	return style;
};
