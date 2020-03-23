import React, {FunctionComponent} from "react";
import {inject, observer} from "mobx-react";
import {
    Card,
    CardActions,
    CardContent,
    CardHeader,
    createStyles,
    makeStyles,
    Theme,
    Typography
} from "@material-ui/core";
import {format, isSameDay, isSameYear} from "date-fns";
import {enUS, ru} from "date-fns/locale";
import randomColor from "randomcolor";
import ReactMarkdown from "react-markdown";
import {MessageEntity} from "../types";
import {Avatar} from "../../Avatar";
import {UserEntity} from "../../User";
import {localized, Localized} from "../../localization";
import {Language} from "../../localization/types";
import {MapMobxToProps} from "../../store";
import {CurrentUser} from "../../api/types/response";

const breaks = require("remark-breaks");

interface MessagesListItemMobxProps {
    findMessage: (id: string) => MessageEntity,
    findUser: (id: string) => UserEntity,
    currentUser?: CurrentUser
}

interface MessagesListItemOwnProps {
    messageId: string
}

type MessagesListItemProps = MessagesListItemMobxProps & MessagesListItemOwnProps & Localized;

const getCreatedAtLabel = (createdAt: Date, currentLocale: Language): string => {
    const currentDate = new Date();
    const locale = currentLocale === "ru" ? ru : enUS;

    if (isSameDay(createdAt, currentDate)) {
        return format(createdAt, "HH:mm", {locale});
    } else if (isSameYear(createdAt, currentDate)) {
        return format(createdAt, "d MMM HH:mm", {locale});
    } else {
        return format(createdAt, "d MMM YYYY HH:mm", {locale});
    }
};

const useStyles = makeStyles((theme: Theme) => createStyles({
    messageListItemWrapper: {
        display: "flex",
        marginBottom: theme.spacing(1)
    },
    messageOfCurrentUserListItemWrapper: {
        [theme.breakpoints.down("md")]: {
            flexDirection: "row-reverse"
        }
    },
    messageCard: {
        borderRadius: 8,
        marginLeft: theme.spacing(1),
        [theme.breakpoints.up("lg")]: {
            maxWidth: "50%"
        },
        [theme.breakpoints.down("md")]: {
            maxWidth: "60%"
        },
        [theme.breakpoints.down("sm")]: {
            maxWidth: "70%"
        }
    },
    messageOfCurrentUserCard: {
        backgroundColor: theme.palette.primary.light,
        color: theme.palette.getContrastText(theme.palette.primary.light)
    },
    cardHeaderRoot: {
        paddingBottom: 0
    },
    cardContentRoot: {
        paddingTop: 0,
        paddingBottom: 0
    },
    cardActionsRoot: {
        paddingTop: 0,
        float: "right"
    }
}));

const _MessageListItem: FunctionComponent<MessagesListItemProps> = ({
    messageId,
    currentUser,
    findMessage,
    findUser,
    locale
}) => {
    const classes = useStyles();
    const message = findMessage(messageId);
    const sender = findUser(message.sender);
    const createAtLabel = getCreatedAtLabel(message.createdAt, locale);
    const color = randomColor({seed: sender.id});
    const avatarLetter = `${sender.firstName[0]}${sender.lastName ? sender.lastName[0] : ""}`;
    const sentByCurrentUser = currentUser && currentUser.id === sender.id;

    return (
        <div className={`${classes.messageListItemWrapper} ${sentByCurrentUser && classes.messageOfCurrentUserListItemWrapper}`}
             id={`message-${messageId}`}
        >
            <Avatar avatarLetter={avatarLetter}
                    avatarColor={color}
                    avatarUri={sender.avatarUri}
            />
            <Card className={`${classes.messageCard} ${sentByCurrentUser && classes.messageOfCurrentUserCard}`}>
                <CardHeader title={
                    <Typography variant="body1" style={{color}}>
                        <strong>{sender.firstName} {sender.lastName && sender.lastName}</strong>
                    </Typography>
                }
                            classes={{
                                root: classes.cardHeaderRoot
                            }}
                />
                <CardContent classes={{
                    root: classes.cardContentRoot
                }}>
                    <ReactMarkdown source={message.text}
                                   plugins={[breaks]}
                    />
                </CardContent>
                <CardActions classes={{
                    root: classes.cardActionsRoot
                }}>
                    <Typography variant="caption" color="textSecondary">
                        {createAtLabel}
                    </Typography>
                </CardActions>
            </Card>
        </div>
    )
};

const mapMobxToProps: MapMobxToProps<MessagesListItemMobxProps> = ({entities, authorization}) => ({
    findMessage: entities.messages.findById,
    findUser: entities.users.findById,
    currentUser: authorization.currentUser
});

export const MessagesListItem = localized(
    inject(mapMobxToProps)(observer(_MessageListItem))
) as FunctionComponent<MessagesListItemOwnProps>;
