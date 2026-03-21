import {BeautifulMentionsItem} from "lexical-beautiful-mentions";

export type MentionData = {
	fromDialog: boolean,
	fromCurrentChat: boolean,
	value: string,
	id: string,
	slug: string,
	url: string,
	displayedText: string
}

export type MentionItem = BeautifulMentionsItem & MentionData;
