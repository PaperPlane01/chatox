import {ChatOfCurrentUserEntity} from "../types";
import {useStore} from "../../store";
import {UserEntity} from "../../User";

export const useChatName = (chat?: ChatOfCurrentUserEntity, chatUser?: UserEntity): string => {
	const {
		chatsOfCurrentUser: {
			getChatName
		}
	} = useStore();

	return getChatName(chat, chatUser);
};
