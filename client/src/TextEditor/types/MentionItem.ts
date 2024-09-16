import {BetterMentionsItem} from "lexical-better-mentions";

export type MentionData = {
	fromDialog: boolean,
	fromCurrentChat: boolean,
	value: string,
	id: string,
	slug: string,
	url: string,
	displayedText: string
}

export type MentionItem = BetterMentionsItem & MentionData;
