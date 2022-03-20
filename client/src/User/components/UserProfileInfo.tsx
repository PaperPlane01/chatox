import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Card, CardHeader, CircularProgress, createStyles, makeStyles, Theme, Typography} from "@material-ui/core";
import {format} from "date-fns";
import randomColor from "randomcolor";
import ReactMarkdown from "react-markdown";
import {UserMenu} from "./UserMenu";
import {DialogWithUserButton} from "./DialogWithUserButton";
import {getDateOfBirthLabel, getOnlineOrLastSeenLabel} from "../utils/labels"
import {Avatar} from "../../Avatar";
import {API_UNREACHABLE_STATUS, ApiError} from "../../api";
import {TranslationFunction} from "../../localization";
import {useLocalization, useStore} from "../../store";
import {HasAnyRole} from "../../Authorization";

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

        const onlineOrLastSeenLabel = getOnlineOrLastSeenLabel(
            user,
            dateFnsLocale,
            l,
            user.online
                ? {className: classes.onlineLabel}
                : undefined
        );

        return (
            <div>
                <Card className={classes.userInfoCard}>
                    <CardHeader avatar={<Avatar avatarLetter={avatarLetter}
                                                avatarColor={color}
                                                avatarId={user.avatarId}
                                                width={64}
                                                height={64}
                                                avatarUri={user.externalAvatarUri}
                    />}
                                title={`${user.firstName} ${user.lastName ? user.lastName : ""}`}
                                subheader={onlineOrLastSeenLabel}
                                action={<UserMenu userId={user.id}/>}
                    />
                </Card>
                <HasAnyRole roles={["ROLE_USER", "ROLE_ANONYMOUS_USER"]}>
                    <DialogWithUserButton/>
                </HasAnyRole>
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
