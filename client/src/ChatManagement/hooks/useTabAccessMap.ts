import {UseChatManagementPermissions} from "./useChatManagementPermissions";
import {ChatManagementTab} from "../types";

export const useTabAccessMap = (permissions: UseChatManagementPermissions): Map<ChatManagementTab, boolean> => {
    const displayChatInfoTab = permissions.canUpdateChat;
    return new Map<ChatManagementTab, boolean>([
        [ChatManagementTab.INFO, displayChatInfoTab],
        [ChatManagementTab.BLOCKINGS, permissions.canBlockUsersInChat],
        [ChatManagementTab.SLOW_MODE, displayChatInfoTab],
        [ChatManagementTab.SECURITY, displayChatInfoTab],
        [ChatManagementTab.ROLES, permissions.canCreateChatRole],
        [ChatManagementTab.DELETION, permissions.canDeleteChat],
        [ChatManagementTab.INVITES, permissions.canManageInvites],
        [ChatManagementTab.JOIN_REQUESTS, permissions.canApproveJoinChatRequests]
    ]);
};
