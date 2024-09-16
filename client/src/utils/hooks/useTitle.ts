import {useStore} from "../../store";

const DEFAULT_TITLE = "Chatox";

export const useTitle = (): string => {
	const {
		chatsPreferences: {
			displayUnreadMessagesCount,
			displayUnreadChatsCount
		},
		chatsOfCurrentUser: {
			totalUnreadMessagesCount,
			unreadChatsCount,
			hasUnreadMentions,
			hasUnreadDialogs
		}
	} = useStore();

	if (!displayUnreadMessagesCount) {
		return DEFAULT_TITLE;
	}

	const prefix = (hasUnreadMentions || hasUnreadDialogs) ? "! " : ""

	if (displayUnreadChatsCount) {
		return unreadChatsCount !== 0 ? `${prefix}(${unreadChatsCount}) ${DEFAULT_TITLE}` : DEFAULT_TITLE ;
	} else {
		return totalUnreadMessagesCount !== 0 ? `${prefix}(${totalUnreadMessagesCount}) ${DEFAULT_TITLE}` : DEFAULT_TITLE;
	}
};
