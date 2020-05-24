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
import {format, isSameDay, isSameYear, Locale} from "date-fns";
import randomColor from "randomcolor";
import ReactMarkdown from "react-markdown";
import {MessageMenu} from "./MessageMenu";
import {MessageEntity} from "../types";
import {Avatar} from "../../Avatar";
import {UserEntity} from "../../User";
import {localized, Localized} from "../../localization";
import {MapMobxToProps} from "../../store";
import {CurrentUser} from "../../api/types/response";
import {Routes} from "../../router";

const breaks = require("remark-breaks");
const {Link} = require("mobx-router");

interface MessagesListItemMobxProps {
    findMessage: (id: string) => MessageEntity,
    findUser: (id: string) => UserEntity,
    currentUser?: CurrentUser,
    routerStore?: any
}

interface MessagesListItemOwnProps {
    messageId: string
}

type MessagesListItemProps = MessagesListItemMobxProps & MessagesListItemOwnProps & Localized;

const getCreatedAtLabel = (createdAt: Date, locale: Locale): string => {
    const currentDate = new Date();

    if (isSameDay(createdAt, currentDate)) {
        return format(createdAt, "HH:mm", {locale});
    } else if (isSameYear(createdAt, currentDate)) {
        return format(createdAt, "d MMM HH:mm", {locale});
    } else {
        return format(createdAt, "d MMM yyyy HH:mm", {locale});
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
        paddingBottom: 0,
        paddingRight: theme.spacing(1),
        alignItems: "flex-start"
    },
    cardHeaderAction: {
        marginRight: -16,
        paddingRight: theme.spacing(1)
    },
    cardContentRoot: {
        paddingTop: 0,
        paddingBottom: 0
    },
    cardActionsRoot: {
        paddingTop: 0,
        float: "right"
    },
    undecoratedLink: {
        textDecoration: "none",
        color: "inherit"
    }
}));

const _MessageListItem: FunctionComponent<MessagesListItemProps> = ({
    messageId,
    currentUser,
    findMessage,
    findUser,
    routerStore,
    dateFnsLocale,
    l
}) => {
    const classes = useStyles();
    const message = findMessage(messageId);
    const sender = findUser(message.sender);
    const createAtLabel = getCreatedAtLabel(message.createdAt, dateFnsLocale);
    const color = randomColor({seed: sender.id});
    const avatarLetter = `${sender.firstName[0]}${sender.lastName ? sender.lastName[0] : ""}`;
    const sentByCurrentUser = currentUser && currentUser.id === sender.id;

    return (
        <div className={`${classes.messageListItemWrapper} ${sentByCurrentUser && classes.messageOfCurrentUserListItemWrapper}`}
             id={`message-${messageId}`}
        >
            <Link store={routerStore}
                  className={classes.undecoratedLink}
                  view={Routes.userPage}
                  params={{slug: sender.slug || sender.id}}
            >
                <Avatar avatarLetter={avatarLetter}
                        avatarColor={color}
                        avatarUri={sender.avatarUri}
                />
            </Link>
            <Card className={`${classes.messageCard} ${sentByCurrentUser && classes.messageOfCurrentUserCard}`}>
                <CardHeader title={
                    <Link store={routerStore}
                          className={classes.undecoratedLink}
                          view={Routes.userPage}
                          params={{slug: sender.slug || sender.id}}
                    >
                        <Typography variant="body1" style={{color}}>
                            <strong>{sender.firstName} {sender.lastName && sender.lastName}</strong>
                        </Typography>
                    </Link>
                }
                            classes={{
                                root: classes.cardHeaderRoot,
                                action: classes.cardHeaderAction
                            }}
                            action={<MessageMenu messageId={messageId}/>}
                />
                <CardContent classes={{
                    root: classes.cardContentRoot
                }}>
                    {message.deleted
                        ? <i>{l("message.deleted")}</i>
                        : (
                            <ReactMarkdown source={message.text}
                                           plugins={[breaks]}
                            />
                        )
                    }
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

const mapMobxToProps: MapMobxToProps<MessagesListItemMobxProps> = ({entities, authorization, store}) => ({
    findMessage: entities.messages.findById,
    findUser: entities.users.findById,
    currentUser: authorization.currentUser,
    routerStore: store
});

export const MessagesListItem = localized(
    inject(mapMobxToProps)(observer(_MessageListItem))
) as FunctionComponent<MessagesListItemOwnProps>;
