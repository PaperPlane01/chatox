import {CSSProperties, DependencyList, RefObject, useLayoutEffect, useState} from "react";
import {ScrollSizeObserver} from "scroll-size-observer";
import {isWindowScrollable} from "../../utils/dom-utils";

export const useMessagesListBottomStyles = (
	onSmallScreen: boolean,
	dependencies: DependencyList,
    messagesListRef: RefObject<HTMLDivElement | null>
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
	}, dependencies);

	useLayoutEffect(() => {
        if (!onSmallScreen) {
            return;
        }

        if (!messagesListRef.current) {
            return;
        }

        const scrollSizeObserver = new ScrollSizeObserver(() => setStyle(calculateStyles()));
        scrollSizeObserver.observe(messagesListRef.current, {scrollWidth: false, scrollHeight: true});

        return () => scrollSizeObserver.disconnect();
	}, [onSmallScreen, messagesListRef.current]);

	return style;
};
