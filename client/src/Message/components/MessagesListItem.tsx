import React, {Fragment, FunctionComponent, memo, useEffect, useLayoutEffect, useRef, useState} from "react";
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
    Typography,
} from "@material-ui/core";
import {Edit} from "@material-ui/icons";
import {format, isSameDay, isSameYear, Locale} from "date-fns";
import randomColor from "randomcolor";
import ReactVisibilitySensor from "react-visibility-sensor";
import {MenuItemType, MessageMenu} from "./MessageMenu";
import {MessageImagesGrid} from "./MessageImagesGrid";
import {ReferredMessageContent} from "./ReferredMessageContent";
import {Avatar} from "../../Avatar";
import {useAuthorization, useLocalization, useRouter, useStore} from "../../store";
import {Routes} from "../../router";
import {MarkdownTextWithEmoji} from "../../Emoji/components";

const {Link} = require("mobx-router");

interface MessagesListItemProps {
    messageId: string,
    fullWidth?: boolean,
    onMenuItemClick?: (menuItemType: MenuItemType) => void,
    onVisibilityChange?: (visible: boolean) => void,
    hideAttachments?: boolean
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
        paddingBottom: theme.spacing(1),
        "& p, ol, ul, pre": {
            marginBlockStart: "unset !important",
            marginBlockEnd: "unset !important",
            paddingBottom: theme.spacing(1)
        }
    },
    messageOfCurrentUserListItemWrapper: {
        [theme.breakpoints.down("md")]: {
            flexDirection: "row-reverse"
        }
    },
    messageCard: {
        borderRadius: 8,
        wordBreak: "break-word",
        [theme.breakpoints.up("lg")]: {
            maxWidth: "70%"
        },
        [theme.breakpoints.down("md")]: {
            maxWidth: "70%"
        },
        [theme.breakpoints.down("sm")]: {
            maxWidth: "85%"
        },
        overflowX: "auto"
    },
    messageCardFullWidth: {
        borderRadius: 8,
        marginLeft: theme.spacing(1),
        wordBreak: "break-word",
        width: "100%",
        overflowX: "auto"
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
    },
    avatarOfCurrentUserContainer: {
        [theme.breakpoints.up("lg")]: {
            paddingRight: theme.spacing(1),
        },
        [theme.breakpoints.down("md")]: {
            paddingLeft: theme.spacing(1),
        }
    },
    avatarContainer: {
        paddingRight: theme.spacing(1),
    },
    withCode: {
        maxWidth: "100%"
    },
    withOneImage: {
        maxWidth: "80%"
    }
}));

const _MessagesListItem: FunctionComponent<MessagesListItemProps> = observer(({
    messageId,
    fullWidth = false,
    onMenuItemClick,
    onVisibilityChange,
    hideAttachments = false
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
    const [width, setWidth] = useState<number | undefined>(undefined)
    const messagesListItemRef = useRef<HTMLDivElement>(null)

    useLayoutEffect(
        () => {
            if (messagesListItemRef.current) {
                setWidth(messagesListItemRef.current.clientWidth);
            }
        },
        [messagesListItemRef]
    );

    useLayoutEffect(
        () => {
            const updateWidth = (): void => {
                if (messagesListItemRef.current) {
                    setWidth(messagesListItemRef.current.clientWidth);
                }
            };

            window.addEventListener("resize", updateWidth);

            return () => window.removeEventListener("resize", updateWidth);
        }
    )

    useEffect(() => {
        return () => {
            if (onVisibilityChange) {
                onVisibilityChange(false);
            }
        }
    }, [])

    const message = findMessage(messageId);
    const sender = findUser(message.sender);
    const createAtLabel = getCreatedAtLabel(message.createdAt, dateFnsLocale);
    const color = randomColor({seed: sender.id});
    const avatarLetter = `${sender.firstName[0]}${sender.lastName ? sender.lastName[0] : ""}`;
    const sentByCurrentUser = currentUser && currentUser.id === sender.id;
    const containsCode = message.text.includes("`");
    const hasOneImage = message.uploads.length === 1;

    const handleMenuItemClick = (menuItemType: MenuItemType): void => {
        if (onMenuItemClick) {
            onMenuItemClick(menuItemType);
        }
    };

    return (
        <ReactVisibilitySensor onChange={onVisibilityChange}>
            <div className={`${classes.messageListItemWrapper} ${sentByCurrentUser && !fullWidth && classes.messageOfCurrentUserListItemWrapper}`}
                 id={`message-${messageId}`}
                 ref={messagesListItemRef}
            >
                <Link store={routerStore}
                      className={`${classes.undecoratedLink} ${sentByCurrentUser ? classes.avatarOfCurrentUserContainer : classes.avatarContainer}`}
                      view={Routes.userPage}
                      params={{slug: sender.slug || sender.id}}
                >
                    <Avatar avatarLetter={avatarLetter}
                            avatarColor={color}
                            avatarId={sender.avatarId}
                    />
                </Link>
                <Card className={`${fullWidth ? classes.messageCardFullWidth : classes.messageCard} ${sentByCurrentUser && classes.messageOfCurrentUserCard} ${containsCode && classes.withCode} ${hasOneImage && !containsCode && classes.withOneImage}`}>
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
                                <Fragment>
                                    <MarkdownTextWithEmoji text={message.text}
                                                           emojiData={message.emoji}
                                    />
                                    {!hideAttachments && message.uploads.length !== 0 && (
                                        <MessageImagesGrid chatUploadsIds={message.uploads}
                                                           parentWidth={width}
                                        />
                                    )}
                                </Fragment>
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
        </ReactVisibilitySensor>
    )
});

export const MessagesListItem = memo(_MessagesListItem);
