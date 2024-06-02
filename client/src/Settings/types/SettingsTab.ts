export enum SettingsTab {
    PROFILE = "profile",
    LANGUAGE = "language",
    SECURITY = "security",
    APPEARANCE = "appearance",
    CHATS = "chats",
    NOTIFICATIONS = "notifications",
    STICKERS = "stickers",
    BLACKLIST = "blacklist"
}

export const getSettingsTabFromString = (settingsTab?: string): SettingsTab => {
    if (!settingsTab) {
        return SettingsTab.PROFILE;
    }

    switch (settingsTab.trim().toLowerCase()) {
        case "profile":
            return SettingsTab.PROFILE;
        case "language":
            return SettingsTab.LANGUAGE;
        case "security":
            return SettingsTab.SECURITY;
        case "appearance":
            return SettingsTab.APPEARANCE;
        case "chats":
            return SettingsTab.CHATS;
        case "notifications":
            return SettingsTab.NOTIFICATIONS;
        case "stickers":
            return SettingsTab.STICKERS;
        case "blacklist":
            return SettingsTab.BLACKLIST;
        default:
            return SettingsTab.PROFILE;
    }
};
