import {useAuthorization, usePermissions, useStore} from "../../store";

export interface UseChatManagementPermissions {
    canUpdateChat: boolean,
    canDeleteChat: boolean,
    hasAccessToChatManagementPage: boolean,
    canCreateChatRole: boolean,
    canBlockUsersInChat: boolean,
    canManageInvites: boolean
}

const NO_PERMISSIONS: UseChatManagementPermissions = {
    canBlockUsersInChat: false,
    canCreateChatRole: false,
    canDeleteChat: false,
    canUpdateChat: false,
    hasAccessToChatManagementPage: false,
    canManageInvites: false
};

export const useChatManagementPermissions = (): UseChatManagementPermissions => {
    const {
        chat: {
            selectedChat
        }
    } = useStore();
    const {currentUser} = useAuthorization();
    const {
        chats: {
            canUpdateChat,
            canDeleteChat,
            hasAccessToChatManagementPage
        },
        chatRoles: {
            canCreateChatRole
        },
        chatBlockings: {
            canBlockUserInChat
        },
        chatInvites: {
            canManageInvites
        }
    } = usePermissions();

    if (!selectedChat || !currentUser || !hasAccessToChatManagementPage(selectedChat.id)) {
        return NO_PERMISSIONS;
    }

    return {
        canUpdateChat: canUpdateChat(selectedChat.id),
        canBlockUsersInChat: canBlockUserInChat(selectedChat.id, currentUser.id),
        canCreateChatRole: canCreateChatRole(selectedChat.id),
        canDeleteChat: canDeleteChat(selectedChat),
        canManageInvites: canManageInvites(selectedChat.id),
        hasAccessToChatManagementPage: true
    };
}