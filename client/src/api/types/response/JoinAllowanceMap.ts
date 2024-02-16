import {UserVerificationLevel} from "./UserVerificationLevel";
import {JoinChatAllowance} from "./JoinChatAllowance";

export type JoinAllowanceMap = {
    [Key in UserVerificationLevel]: JoinChatAllowance
}

export const populateJoinAllowanceSettings = (chatSettings: Partial<JoinAllowanceMap>): JoinAllowanceMap => {
    const settings: Partial<JoinAllowanceMap> = {};

    Object.keys(UserVerificationLevel).forEach(verificationLevel => {
        const key = verificationLevel as UserVerificationLevel;
        settings[key] = chatSettings[key] ?? JoinChatAllowance.ALLOWED;
    });

    return settings as unknown as JoinAllowanceMap;
};
