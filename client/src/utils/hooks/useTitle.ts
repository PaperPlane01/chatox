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
			unreadChatsCount
		}
	} = useStore();

	if (!displayUnreadMessagesCount) {
		return DEFAULT_TITLE;
	}

	if (displayUnreadChatsCount) {
		return unreadChatsCount !== 0 ? `(${unreadChatsCount}) ${DEFAULT_TITLE}` : DEFAULT_TITLE ;
	} else {
		return totalUnreadMessagesCount !== 0 ? `(${totalUnreadMessagesCount}) ${DEFAULT_TITLE}` : DEFAULT_TITLE;
	}
}