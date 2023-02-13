import {CSSProperties, DependencyList, useLayoutEffect, useState} from "react";
import useResizeObserver from "@react-hook/resize-observer";
import {MessagesListRefs} from "../types";

export const useMessagesListStyles = (
    calculateStyles: () => CSSProperties,
    refs: MessagesListRefs,
    dependencies: DependencyList
): CSSProperties => {
    const [style, setStyle] = useState(calculateStyles());

    const handleResize = (): void => setStyle(calculateStyles());

    useLayoutEffect(() => {
        window.addEventListener("resize", handleResize);

        return () => document.removeEventListener("resize", handleResize);
    });
    useLayoutEffect(
        handleResize,
        dependencies
    );
    useResizeObserver(refs.messagesListBottomRef, handleResize);

    return style;
};