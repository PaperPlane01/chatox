import {Labels, TranslationFunction} from "../../localization/types";
import {User} from "../../api/types/response";
import {UserEntity} from "../../User/types";
import {GlobalBanEntity} from "../types";
import {format} from "date-fns";

type FindUserFunction = (id: string) => UserEntity

interface PossibleBindings {
    createdByUsername: string,
    expiresAt?: string,
    reason: string,
    comment?: string
}

export const getGlobalBanLabel = (globalBan: GlobalBanEntity, l: TranslationFunction, dateFnsLocale: Locale, findUser: FindUserFunction): string => {
    const createdBy = findUser(globalBan.createdById);
    let label: keyof Labels;
    let bindings: PossibleBindings;

    if (globalBan.permanent) {
        if (globalBan.comment) {
            label = "global.ban.you-were-banned.permanently.with-reason-and-comment";
            bindings = {
                createdByUsername: getUserDisplayedName(createdBy),
                reason: l(`global.ban.reason.${globalBan.reason}` as keyof Labels),
                comment: globalBan.comment
            }
        } else {
            label = "global.ban.you-were-banned.permanently.with-reason";
            bindings = {
                createdByUsername: getUserDisplayedName(createdBy),
                reason: l(`global.ban.reason.${globalBan.reason}` as keyof Labels)
            }
        }
    } else {
        const expiresAt = format(
            globalBan.expiresAt!,
            "dd MMMM yyyy HH:mm:ss",
            {locale: dateFnsLocale}
        );

        if (globalBan.comment) {
            label = "global.ban.you-were-banned.with-reason-and-comment";
            bindings = {
                expiresAt,
                reason: l(`global.ban.reason.${globalBan.reason}` as keyof Labels),
                createdByUsername: getUserDisplayedName(createdBy),
                comment: globalBan.comment
            };
        } else {
            label = "global.ban.you-were-banned.permanently.with-reason";
            bindings = {
                expiresAt,
                createdByUsername: getUserDisplayedName(createdBy),
                reason: l(`global.ban.reason.${globalBan.reason}` as keyof Labels),
                comment: globalBan.comment
            }
        }
    }

    return l(label, bindings);
};

const getUserDisplayedName = (user: UserEntity): string => {
    if (user.lastName) {
        return `${user.firstName} ${user.lastName}`;
    } else {
        return `${user.firstName}`;
    }
};