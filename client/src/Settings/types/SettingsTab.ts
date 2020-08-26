export enum SettingsTab {
    PROFILE = "profile",
    LANGUAGE = "language",
    SECURITY = "security"
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
        default:
            return SettingsTab.PROFILE;
    }
};
