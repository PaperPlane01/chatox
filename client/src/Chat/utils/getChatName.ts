import {ChatOfCurrentUserEntity} from "../types";
import {UserEntity} from "../../User";
import {getUserDisplayedName} from "../../User/utils/labels";

export const getChatName = (chat: ChatOfCurrentUserEntity, chatUser?: UserEntity): string => {
	if (chatUser) {
		return getUserDisplayedName(chatUser);
	}

	return chat.name;
};
