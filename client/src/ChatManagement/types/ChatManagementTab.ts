export enum ChatManagementTab {
    INFO = "INFO",
    PARTICIPANTS = "PARTICIPANTS",
    SLOW_MODE = "SLOW_MODE",
    ROLES = "ROLES",
    BLOCKINGS = "BLOCKINGS",
    SECURITY = "SECURITY",
    DELETION = "DELETION",
    INVITES = "INVITES"
}

export const getChatManagementTabFromString = (tabString?: string): ChatManagementTab => {
    if (!tabString) {
        return ChatManagementTab.INFO;
    }

    const key = tabString.toUpperCase().trim();

    if (Object.keys(ChatManagementTab).includes(key)) {
        return ChatManagementTab[key as keyof typeof ChatManagementTab];
    } else {
        return ChatManagementTab.INFO;
    }
};

export const CHAT_MANAGEMENT_TABS: ChatManagementTab[] = [
    ChatManagementTab.INFO,
    ChatManagementTab.SLOW_MODE,
    ChatManagementTab.PARTICIPANTS,
    ChatManagementTab.INVITES,
    ChatManagementTab.SECURITY,
    ChatManagementTab.BLOCKINGS,
    ChatManagementTab.ROLES,
    ChatManagementTab.DELETION,
];
