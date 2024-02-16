import {useAuthorization, useStore} from "../../store";

export const useChatManagementPending = (): boolean => {
    const {
        chatsOfCurrentUser: {
            pending: chatsOfCurrentUserPending
        },
        chat: {
            pending: selectedChatPending
        }
    } = useStore();
    const {fetchingCurrentUser} = useAuthorization();

    return chatsOfCurrentUserPending || selectedChatPending || fetchingCurrentUser;
}