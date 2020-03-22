import React, {FunctionComponent} from "react";
import {inject, observer} from "mobx-react";
import {Card, CardHeader, CardContent, CardActions, Typography, createStyles, makeStyles, Theme} from "@material-ui/core";
import {format, differenceInDays, differenceInYears} from "date-fns";
import {enUS, ru} from "date-fns/locale";
import randomColor from "randomcolor";
import ReactMarkdown from "react-markdown";
import {MessageEntity} from "../types";
import {Avatar} from "../../Avatar";
import {UserEntity} from "../../User";
import {localized, Localized} from "../../localization";
import {Language} from "../../localization/types";
import {MapMobxToProps} from "../../store";

const breaks = require("remark-breaks");

interface MessagesListItemMobxProps {
    findMessage: (id: string) => MessageEntity,
    findUser: (id: string) => UserEntity
}

interface MessagesListItemOwnProps {
    messageId: string
}

type MessagesListItemProps = MessagesListItemMobxProps & MessagesListItemOwnProps & Localized;

const getCreatedAtLabel = (createdAt: Date, currentLocale: Language): string => {
    const currentDate = new Date();
    const locale = currentLocale === "ru" ? ru : enUS;

    if (differenceInDays(createdAt, currentDate) < 1) {
        return format(createdAt, "HH:mm", {locale});
    } else if (differenceInYears(createdAt, currentDate) < 1) {
        return format(createdAt, "D MMM HH:mm", {locale});
    } else {
        return format(createdAt, "D MMM YYYY HH:mm", {locale});
    }
};

const useStyles = makeStyles((theme: Theme) => createStyles({
    messageListItemWrapper: {
        display: "flex",
        marginBottom: theme.spacing(1)
    },
    messageCard: {
        borderRadius: 8,
        marginLeft: theme.spacing(1),
        [theme.breakpoints.up("lg")]: {
            maxWidth: "50%"
        },
        [theme.breakpoints.down("md")]: {
            maxWidth: "70%"
        },
        [theme.breakpoints.down("sm")]: {
            maxWidth: "90%"
        }
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

    return (
        <div className={classes.messageListItemWrapper}
             id={`message-${messageId}`}
        >
            <Avatar avatarLetter={avatarLetter}
                    avatarColor={color}
                    avatarUri={sender.avatarUri}
            />
            <Card className={classes.messageCard}>
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

const mapMobxToProps: MapMobxToProps<MessagesListItemMobxProps> = ({entities}) => ({
    findMessage: entities.messages.findById,
    findUser: entities.users.findById
});

export const MessagesListItem = localized(
    inject(mapMobxToProps)(observer(_MessageListItem))
) as FunctionComponent<MessagesListItemOwnProps>;
