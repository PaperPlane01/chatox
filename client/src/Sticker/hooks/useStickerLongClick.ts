import {LongPressCallbackReason, LongPressHandlers, useLongPress} from "use-long-press";
import {isPointerEvent} from "../../utils/event-utils";

interface UseStickerLongClick {
	stickerId: string,
	onClick?: () => void,
	onLongClick?: () => void
}

export const useStickerLongClick = ({stickerId, onClick, onLongClick}: UseStickerLongClick): LongPressHandlers => {
	const createLongPressHandlers = useLongPress(
		onLongClick ?? onClick ?? null,
		{
			onCancel: (_, {reason}) => reason === LongPressCallbackReason.CancelledByRelease && onClick && onClick(),
			filterEvents: event => isPointerEvent(event) ? event.button !== 2 : true
		}
	);
	return createLongPressHandlers(`sticker_${stickerId}`);
};
