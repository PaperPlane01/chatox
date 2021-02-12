import {MouseEvent} from "react";

export const ensureEventWontPropagate = (event: MouseEvent): void => {
    event.preventDefault();
    event.stopPropagation();
    event.nativeEvent.preventDefault();
    event.nativeEvent.stopImmediatePropagation();
    event.nativeEvent.stopPropagation();
};
