import {isDefined} from "../../utils/object-utils";

export enum MessageEditorType {
	PLAIN_TEXT = "PLAIN_TEXT",
	RICH_TEXT = "RICH_TEXT"
}

const VALUES = [MessageEditorType.PLAIN_TEXT, MessageEditorType.RICH_TEXT];

export const parseMessageEditorType = (messageEditorType: string | null | undefined): MessageEditorType => {
	if (!isDefined(messageEditorType)) {
		return MessageEditorType.PLAIN_TEXT;
	}

	messageEditorType = messageEditorType.toUpperCase().trim();

	return VALUES.find(type => type === messageEditorType) ?? MessageEditorType.PLAIN_TEXT;
};
