import {MouseEvent, SyntheticEvent} from "react";

export const ensureEventWontPropagate = (event: MouseEvent | SyntheticEvent<any>): void => {
    event.preventDefault();
    event.stopPropagation();
    event.nativeEvent.preventDefault();
    event.nativeEvent.stopImmediatePropagation();
    event.nativeEvent.stopPropagation();
};
