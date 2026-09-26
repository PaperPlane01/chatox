import {MouseEvent as ReactMouseEvent, SyntheticEvent, UIEvent} from "react";
import {LongPressCallbackReason, LongPressOptions} from "use-long-press";

export const ensureEventWontPropagate = (event: ReactMouseEvent | SyntheticEvent<any>): void => {
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

const getPointerEvent = () => window?.PointerEvent ?? null;

export const isPointerEvent = <Target extends Element>(event: SyntheticEvent<Target>): event is ReactMouseEvent<Target> => {
    if (!event.nativeEvent) {
        return false;
    }

    const PointerEvent = getPointerEvent();

    return (PointerEvent && event.nativeEvent instanceof PointerEvent) || "pointerId" in event.nativeEvent;
};

export const createLongPressOptions = (onClick?: () => void): LongPressOptions => ({
    onCancel: (_, {reason}) => reason === LongPressCallbackReason.CancelledByRelease && onClick?.(),
    filterEvents: event => isPointerEvent(event) ? event.button !== 2 : true
});
