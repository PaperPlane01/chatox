import React, {FunctionComponent, ReactNode} from "react";
import {observer} from "mobx-react";
import {Card, CardHeader, CircularProgress, createStyles, makeStyles, Theme, Typography} from "@material-ui/core";
import {format, formatDistanceStrict, isSameDay, isSameYear, Locale} from "date-fns";
import randomColor from "randomcolor";
import ReactMarkdown from "react-markdown";
import {Avatar} from "../../Avatar";
import {API_UNREACHABLE_STATUS, ApiError} from "../../api";
import {TranslationFunction} from "../../localization";
import {useLocalization, useStore} from "../../store";

const breaks = require("remark-breaks");

const useStyles = makeStyles((theme: Theme) => createStyles({
    centered: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100%"
    },
    userInfoCard: {
        marginBottom: theme.spacing(1),
        wordBreak: "break-word",
        maxWidth: 420
    },
    onlineLabel: {
        color: theme.palette.primary.main
    }
}));

const getErrorLabel = (apiError: ApiError, l: TranslationFunction): string => {
    if (apiError.status === 404) {
        return l("user.error.not-found");
    } else if (apiError.status !== API_UNREACHABLE_STATUS) {
        return l("user.error.with-status", {errorStatus: apiError});
    } else return l("user.error.server-unreachable");
};

const getDateOfBirthLabel = (dateOfBirth: Date, dateFnsLocale: Locale): string => {
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

const getLastSeenLabel = (lastSeen: Date, locale: Locale): string => {
    const currentDate = new Date();

    if (isSameDay(lastSeen, currentDate)) {
        return format(lastSeen, "HH:mm", {locale});
    } else if (isSameYear(lastSeen, currentDate)) {
        return format(lastSeen, "d MMM HH:mm", {locale});
    } else {
        return format(lastSeen, "d MMM yyyy HH:mm", {locale});
    }
};

export const UserProfileInfo: FunctionComponent = observer(() => {
    const {
        userProfile: {
            pending,
            error,
            selectedUserId: userId
        },
        entities: {
            users: {
                findById: findUser
            }
        }
    } = useStore();
    const {l, dateFnsLocale} = useLocalization();
    const classes = useStyles();

    if (pending) {
        return <CircularProgress className={classes.centered} size={25}/>
    } else if (error) {
        return <Typography>{getErrorLabel(error, l)}</Typography>
    } else if (userId) {
        const user = findUser(userId);
        const avatarLetter = `${user.firstName[0]} ${user.lastName ? user.lastName[0] : ""}`;
        const color = randomColor({seed: user.id});

        let onlineOrLastSeenLabel: ReactNode;

        if (user.online) {
            onlineOrLastSeenLabel = (
                <Typography className={classes.onlineLabel}>
                    {l("user.profile.online")}
                </Typography>
            )
        } else if (user.lastSeen) {
            onlineOrLastSeenLabel = (
                <Typography>
                    {l("user.profile.last-seen", {lastSeenLabel: getLastSeenLabel(user.lastSeen, dateFnsLocale)})}
                </Typography>
            )
        } else {
            onlineOrLastSeenLabel = null;
        }

        return (
            <div>
                <Card className={classes.userInfoCard}>
                    <CardHeader avatar={<Avatar avatarLetter={avatarLetter}
                                                avatarColor={color}
                                                avatarId={user.avatarId}
                                                width={64}
                                                height={64}
                    />}
                                title={`${user.firstName} ${user.lastName ? user.lastName : ""}`}
                                subheader={onlineOrLastSeenLabel}

                    />
                </Card>
                <Card className={classes.userInfoCard}>
                    {user.slug && user.slug !== user.id && (
                        <CardHeader title={
                            <Typography>
                                <strong>{l("user.profile.username")}</strong>
                            </Typography>
                        }
                                    subheader={
                                        <Typography>
                                            {user.slug}
                                        </Typography>
                                    }
                        />
                    )}
                    <CardHeader title={
                        <Typography>
                            <strong>{l("user.profile.id")}</strong>
                        </Typography>
                    }
                                subheader={
                                    <Typography>
                                        {user.id}
                                    </Typography>
                                }
                    />
                    <CardHeader title={
                        <Typography>
                            <strong>{l("user.profile.registration-date")}</strong>
                        </Typography>
                    }
                                subheader={
                                    <Typography>
                                        {format(user.createdAt, "dd MMMM yyyy", {locale: dateFnsLocale})}
                                    </Typography>
                                }
                    />
                </Card>
                {(user.dateOfBirth || (user.bio && user.bio.length !== 0)) && (
                    <Card className={classes.userInfoCard}>
                        {user.dateOfBirth && (
                            <CardHeader title={
                                <Typography>
                                    <strong>{l("user.profile.birth-date")}</strong>
                                </Typography>
                            }
                                        subheader={
                                            <Typography>
                                                {getDateOfBirthLabel(user.dateOfBirth, dateFnsLocale)}
                                            </Typography>
                                        }
                            />
                        )}
                        {user.bio && (
                            <CardHeader title={
                                <Typography>
                                    <strong>{l("user.profile.bio")}</strong>
                                </Typography>
                            }
                                        subheader={
                                            <Typography>
                                                <ReactMarkdown source={user.bio}
                                                               plugins={[breaks]}
                                                />
                                            </Typography>
                                        }
                            />
                        )}
                    </Card>
                )}
            </div>
        )
    } else {
        return null;
    }
});
