import {isDefined} from "../../utils/object-utils";

export enum MessageEditorType {
	PLAIN_TEXT = "PLAIN_TEXT",
	RICH_TEXT = "RICH_TEXT"
}

export const parseMessageEditorType = (messageEditorType: string | null | undefined): MessageEditorType => {
	if (!isDefined(messageEditorType)) {
		return MessageEditorType.PLAIN_TEXT;
	}

	switch (messageEditorType.toUpperCase().trim()) {
		case "RICH_TEXT":
			return MessageEditorType.RICH_TEXT;
		case "PLAIN_TEXT":
		default:
			return MessageEditorType.PLAIN_TEXT;
	}
}