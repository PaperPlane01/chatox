import React, {FunctionComponent} from "react";
import {inject, observer} from "mobx-react";
import {Card, CardHeader, CircularProgress, createStyles, makeStyles, Theme, Typography} from "@material-ui/core";
import {format, formatDistanceStrict} from "date-fns";
import randomColor from "randomcolor";
import ReactMarkdown from "react-markdown";
import {UserEntity} from "../types";
import {Avatar} from "../../Avatar";
import {API_UNREACHABLE_STATUS, ApiError} from "../../api";
import {localized, Localized, TranslationFunction} from "../../localization";
import {MapMobxToProps} from "../../store";

const breaks = require("remark-breaks");

interface UserProfileInfoMobxProps {
    pending: boolean,
    error?: ApiError,
    userId: string | undefined,
    findUser: (id: string) => UserEntity
}

type UserProfileInfoProps = UserProfileInfoMobxProps & Localized;

const useStyles = makeStyles((theme: Theme) => createStyles({
    centered: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100%"
    },
    userInfoCard: {
        marginBottom: theme.spacing(1)
    }
}));

const getErrorLabel = (apiError: ApiError, l: TranslationFunction): string => {
    if (apiError.status === 404) {
        return l("user.error.not-found");
    } else if (apiError.status !== API_UNREACHABLE_STATUS) {
        return l("user.error.with-status", {errorStatus: apiError});
    } else return l("user.error.server-unreachable");
};

const _UserProfileInfo: FunctionComponent<UserProfileInfoProps> = ({
    pending,
    error,
    findUser,
    userId,
    l,
    dateFnsLocale
}) => {
    const classes = useStyles();

    if (pending) {
        return <CircularProgress className={classes.centered}/>
    } else if (error) {
        return <Typography>{getErrorLabel(error, l)}</Typography>
    } else if (userId) {
        const user = findUser(userId);
        const avatarLetter = `${user.firstName[0]} ${user.lastName ? user.lastName[0] : ""}`;
        const color = randomColor({seed: user.id});

        return (
            <div>
                <Card className={classes.userInfoCard}>
                    <CardHeader avatar={<Avatar avatarLetter={avatarLetter}
                                                avatarColor={color}
                                                avatarUri={user.avatarUri}
                                                width={80}
                                                height={80}
                    />}
                                title={`${user.firstName} ${user.lastName ? user.lastName : ""}`}

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
                                                {format(user.dateOfBirth, "dd MMMM yyyy", {locale: dateFnsLocale})} ({formatDistanceStrict(user.dateOfBirth, new Date(), {locale: dateFnsLocale, unit: "year"})})
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
};

const mapMobxToProps: MapMobxToProps<UserProfileInfoMobxProps> = ({entities, userProfile}) => ({
    userId: userProfile.selectedUserId,
    pending: userProfile.pending,
    error: userProfile.error,
    findUser: entities.users.findById
});

export const UserProfileInfo = localized(
    inject(mapMobxToProps)(observer(_UserProfileInfo))
) as FunctionComponent;
