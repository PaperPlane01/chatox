export enum SettingsTab {
    PROFILE = "profile",
    LANGUAGE = "language"
}

export const getSettingsTabFromString = (settingsTab?: string): SettingsTab => {
    console.log(settingsTab);

    if (!settingsTab) {
        return SettingsTab.PROFILE;
    }

    switch (settingsTab.trim().toLowerCase()) {
        case "profile":
            return SettingsTab.PROFILE;
        case "language":
            return SettingsTab.LANGUAGE;
        default:
            return SettingsTab.PROFILE;
    }
};
