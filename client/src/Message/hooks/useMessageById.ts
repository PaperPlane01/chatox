import {FindMessageFunction, MessageEntity} from "../types";
import {useEntityById} from "../../entities";

export const useMessageById = (
	id: string,
	scheduled: boolean,
	override?: FindMessageFunction
): MessageEntity => {
	let messageId: string | undefined = undefined;

	if (!scheduled && !override) {
		messageId = id;
	}

	let scheduledMessageId: string | undefined;

	if (scheduled && !override) {
		scheduledMessageId = id;
	}

	const message = useEntityById("messages", messageId);
	const scheduledMessage = useEntityById("scheduledMessages", scheduledMessageId);

	if (override) {
		return override(id);
	} else if (!scheduled) {
		return message!;
	} else {
		return scheduledMessage!;
	}
};
