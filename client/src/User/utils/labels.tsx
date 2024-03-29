import React, {ReactNode} from "react";
import {Typography, TypographyProps} from "@mui/material";
import {format, formatDistanceStrict, isSameDay, isSameYear, Locale} from "date-fns";
import {isStringEmpty} from "../../utils/string-utils";
import {UserEntity} from "../types";
import {TranslationFunction} from "../../localization";

interface WithFirstNameAndLastName {
    firstName: string,
    lastName?: string
}

export const getUserAvatarLabel = (user: WithFirstNameAndLastName): string => {
    return `${user.firstName[0]} ${user.lastName ? user.lastName[0] : ""}`;
};


export const getUserDisplayedName = (user: {firstName: string, lastName?: string}): string => {
    if (isStringEmpty(user.lastName)) {
        return `${user.firstName}`;
    } else {
        return `${user.firstName} ${user.lastName}`;
    }
};

export const getDateOfBirthLabel = (dateOfBirth: Date, dateFnsLocale: Locale): string => {
    const dateLabel = format(dateOfBirth, "dd MMMM yyyy", {locale: dateFnsLocale});
    const ageLabel = formatDistanceStrict(
        dateOfBirth,
        new Date(),
        {
            unit: "year",
            locale: dateFnsLocale
        }
    );
    return `${dateLabel} (${ageLabel})`;
};

export const getLastSeenLabel = (lastSeen: Date, locale: Locale): string => {
    const currentDate = new Date();

    if (isSameDay(lastSeen, currentDate)) {
        return format(lastSeen, "HH:mm", {locale});
    } else if (isSameYear(lastSeen, currentDate)) {
        return format(lastSeen, "d MMM HH:mm", {locale});
    } else {
        return format(lastSeen, "d MMM yyyy HH:mm", {locale});
    }
};

export const getOnlineOrLastSeenLabel = (user: UserEntity, dateFnsLocale: Locale, l: TranslationFunction, typographyProps?: TypographyProps): ReactNode => {
    let onlineOrLastSeenLabel: ReactNode;
    const props = typographyProps ?? {};

    if (user.online) {
        onlineOrLastSeenLabel = (
            <Typography {...props}>
                {l("user.profile.online")}
            </Typography>
        )
    } else if (user.lastSeen) {
        onlineOrLastSeenLabel = (
            <Typography {...props}
            >
                {l("user.profile.last-seen", {lastSeenLabel: getLastSeenLabel(user.lastSeen, dateFnsLocale)})}
            </Typography>
        )
    } else {
        onlineOrLastSeenLabel = null;
    }

    return onlineOrLastSeenLabel;
};
