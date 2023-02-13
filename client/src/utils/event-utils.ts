import {MouseEvent, SyntheticEvent, UIEvent} from "react";

export const ensureEventWontPropagate = (event: MouseEvent | SyntheticEvent<any>): void => {
    event.preventDefault();
    event.stopPropagation();
    event.nativeEvent.preventDefault();
    event.nativeEvent.stopImmediatePropagation();
    event.nativeEvent.stopPropagation();
};

export const isScrolledToBottom = (event: UIEvent<HTMLDivElement>): boolean => {
    const {scrollHeight, scrollTop, clientHeight} = event.currentTarget;
    return Math.abs(scrollHeight - (scrollTop + clientHeight)) <= 1;
};