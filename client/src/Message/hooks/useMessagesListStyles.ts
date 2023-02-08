import {CSSProperties, DependencyList, useEffect, useLayoutEffect, useState} from "react";
import useResizeObserver from "@react-hook/resize-observer";
import {MessagesListRefs} from "../types";

export const useMessagesListStyles = (
    calculateStyles: () => CSSProperties,
    refs: MessagesListRefs,
    dependencies: DependencyList
): CSSProperties => {

    const [style, setStyle] = useState(calculateStyles());

    const handleResize = (): void => setStyle(calculateStyles());

    useEffect(() => {
        document.addEventListener("resize", handleResize);

        return () => document.removeEventListener("resize", handleResize);
    });
    useLayoutEffect(
        () => setStyle(calculateStyles()),
        dependencies
    );
    useResizeObserver(refs.messagesListBottomRef, () => setStyle(calculateStyles()));

    return style;
}