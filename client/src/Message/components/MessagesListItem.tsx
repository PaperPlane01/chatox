import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {
    Card,
    CardActions,
    CardContent,
    CardHeader,
    createStyles,
    makeStyles,
    Theme,
    Tooltip,
    Typography
} from "@material-ui/core";
import {Edit} from "@material-ui/icons";
import {format, isSameDay, isSameYear, Locale} from "date-fns";
import randomColor from "randomcolor";
import {MenuItemType, MessageMenu} from "./MessageMenu";
import {ReferredMessageContent} from "./ReferredMessageContent";
import {Avatar} from "../../Avatar";
import {useAuthorization, useLocalization, useRouter, useStore} from "../../store";
import {Routes} from "../../router";
import {MarkdownTextWithEmoji} from "../../Emoji/components";

const {Link} = require("mobx-router");

interface MessagesListItemProps {
    messageId: string,
    fullWidth?: boolean,
    onMenuItemClick?: (menuItemType: MenuItemType) => void
}

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
        wordBreak: "break-word",
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
    messageCardFullWidth: {
        borderRadius: 8,
        marginLeft: theme.spacing(1),
        wordBreak: "break-word",
        width: "100%"
    },
    messageOfCurrentUserCard: {
        backgroundColor: theme.palette.primary.light,
        color: theme.palette.getContrastText(theme.palette.primary.light)
    },
    cardHeaderRoot: {
        paddingBottom: 0,
        alignItems: "flex-start"
    },
    cardHeaderContent: {
        paddingRight: theme.spacing(1),
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

export const MessagesListItem: FunctionComponent<MessagesListItemProps> = observer(({
    messageId,
    fullWidth = false,
    onMenuItemClick
}) => {
    const {
        entities: {
            users: {
                findById: findUser
            },
            messages: {
                findById: findMessage
            }
        }
    } = useStore();
    const {l, dateFnsLocale} = useLocalization();
    const {currentUser} = useAuthorization();
    const routerStore = useRouter();
    const classes = useStyles();

    const message = findMessage(messageId);
    const sender = findUser(message.sender);
    const createAtLabel = getCreatedAtLabel(message.createdAt, dateFnsLocale);
    const color = randomColor({seed: sender.id});
    const avatarLetter = `${sender.firstName[0]}${sender.lastName ? sender.lastName[0] : ""}`;
    const sentByCurrentUser = currentUser && currentUser.id === sender.id;

    const handleMenuItemClick = (menuItemType: MenuItemType): void => {
        if (onMenuItemClick) {
            onMenuItemClick(menuItemType);
        }
    };

    return (
        <div className={`${classes.messageListItemWrapper} ${sentByCurrentUser && !fullWidth && classes.messageOfCurrentUserListItemWrapper}`}
             id={`message-${messageId}`}
        >
            <Link store={routerStore}
                  className={classes.undecoratedLink}
                  view={Routes.userPage}
                  params={{slug: sender.slug || sender.id}}
            >
                <Avatar avatarLetter={avatarLetter}
                        avatarColor={color}
                        avatarId={sender.avatarId}
                />
            </Link>
            <Card className={`${fullWidth ? classes.messageCardFullWidth : classes.messageCard} ${sentByCurrentUser && classes.messageOfCurrentUserCard}`}>
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
                                action: classes.cardHeaderAction,
                                content: classes.cardHeaderContent
                            }}
                            action={<MessageMenu messageId={messageId} onMenuItemClick={handleMenuItemClick}/>}
                />
                <CardContent classes={{
                    root: classes.cardContentRoot
                }}>
                    <ReferredMessageContent messageId={message.referredMessageId}/>
                    {message.deleted
                        ? <i>{l("message.deleted")}</i>
                        : (
                            <MarkdownTextWithEmoji text={message.text}
                                                   emojiData={message.emoji}
                            />
                        )
                    }
                </CardContent>
                <CardActions classes={{
                    root: classes.cardActionsRoot
                }}>
                    <Typography variant="caption" color="textSecondary">
                        {createAtLabel}
                        {message.updatedAt && (
                            <Tooltip title={l("message.updated-at", {updatedAt: getCreatedAtLabel(message.updatedAt, dateFnsLocale)})}>
                                <span>
                                    ,
                                    {" "}
                                    <Edit fontSize="inherit"/>
                                    {l("message.edited")}
                                </span>
                            </Tooltip>
                        )}
                    </Typography>
                </CardActions>
            </Card>
        </div>
    )
});
