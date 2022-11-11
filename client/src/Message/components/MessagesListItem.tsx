import React, {Fragment, FunctionComponent, memo, ReactNode, useEffect, useRef, useState} from "react";
import {observer} from "mobx-react";
import {Card, CardActions, CardContent, CardHeader, Theme, Tooltip, Typography} from "@mui/material";
import {createStyles, makeStyles} from "@mui/styles";
import {Edit, Event} from "@mui/icons-material";
import {format, isSameDay, isSameYear, Locale} from "date-fns";
import randomColor from "randomcolor";
import ReactVisibilitySensor from "react-visibility-sensor";
import clsx from "clsx";
import {MessageMenu, MessageMenuItemType} from "./MessageMenu";
import {ScheduledMessageMenu, ScheduledMessageMenuItemType} from "./ScheduledMessageMenu";
import {MessageImagesGrid} from "./MessageImagesGrid";
import {ReferredMessageContent} from "./ReferredMessageContent";
import {MessageAudios} from "./MessageAudios";
import {MessageFiles} from "./MessageFiles";
import {MessageSticker} from "./MessageSticker";
import {Avatar} from "../../Avatar";
import {useAuthorization, useEntities, useLocalization, useRouter, useStore} from "../../store";
import {Routes} from "../../router";
import {MarkdownTextWithEmoji} from "../../Emoji";
import {TranslationFunction} from "../../localization";
import {MessageEntity} from "../types";
import {UserEntity} from "../../User";
import {getChatRoleTranslation} from "../../ChatRole/utils";
import {toJS} from "mobx";

const {Link} = require("mobx-router");

interface MessagesListItemProps {
    messageId: string,
    fullWidth?: boolean,
    onMenuItemClick?: (menuItemType: MessageMenuItemType | ScheduledMessageMenuItemType) => void,
    onVisibilityChange?: (visible: boolean) => void,
    hideAttachments?: boolean,
    inverted?: boolean,
    messagesListHeight?: number,
    scheduledMessage?: boolean,
    findMessageFunction?: (id: string) => MessageEntity,
    findMessageSenderFunction?: (id: string) => UserEntity,
    menu?: ReactNode
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

const getScheduledAtLabel = (scheduledAt: Date, locale: Locale, l: TranslationFunction): string => {
    const dateLabel = getCreatedAtLabel(scheduledAt, locale);

    return l("message.scheduled-at", {scheduleDate: dateLabel});
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
        [theme.breakpoints.down("lg")]: {
            flexDirection: "row-reverse"
        }
    },
    messageCard: {
        borderRadius: 8,
        wordBreak: "break-word",
        [theme.breakpoints.up("lg")]: {
            maxWidth: "50%"
        },
        [theme.breakpoints.down("lg")]: {
            maxWidth: "60%"
        },
        [theme.breakpoints.down("md")]: {
            maxWidth: "80%"
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
        padding: 0
    },
    cardContentWithPadding: {
        paddingLeft: theme.spacing(2),
        paddingRight: theme.spacing(2)
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
        [theme.breakpoints.down("lg")]: {
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
        [theme.breakpoints.up("lg")]: {
            width: "30% !important"
        },
        [theme.breakpoints.down("lg")]: {
            width: "70% !important"
        },
        [theme.breakpoints.down("md")]: {
            width: "80% !important"
        },
    },
    inverted: {
        transform: "scaleY(-1)"
    },
    messageSender: {
        display: "flex"
    },
    senderChatRole: {
        paddingLeft: theme.spacing(1),
        paddingTop: theme.spacing(0.5)
    }
}));

let messageCardDimensionsCache: {[messageId: string]: {width: number, height: number}} = {};

window.addEventListener("resize", () => messageCardDimensionsCache = {});

const _MessagesListItem: FunctionComponent<MessagesListItemProps> = observer(({
    messageId,
    fullWidth = false,
    onMenuItemClick,
    onVisibilityChange,
    hideAttachments = false,
    inverted = false,
    messagesListHeight,
    scheduledMessage = false,
    findMessageFunction,
    findMessageSenderFunction,
    menu
}) => {
    const {
        markMessageRead: {
            addMessageToQueue
        }
    } = useStore();
    const {
        users: {
            findById: findUser
        },
        messages: {
            findById: findMessage
        },
        scheduledMessages: {
            findById: findScheduledMessage
        },
        chatRoles: {
            findById: findChatRole
        }
    } = useEntities();
    const {l, dateFnsLocale} = useLocalization();
    const {currentUser} = useAuthorization();
    const routerStore = useRouter();
    const classes = useStyles();
    const [width, setWidth] = useState<number | undefined>(undefined);
    const [height, setHeight] = useState<number | undefined>(undefined);

    const message = findMessageFunction
        ? findMessageFunction(messageId)
        : !scheduledMessage ? findMessage(messageId) : findScheduledMessage(messageId);

    const [allImagesLoaded, setAllImagesLoaded] = useState(message.images.length === 0);
    const [stickerLoaded, setStickerLoaded] = useState(message.stickerId === undefined);
    const messagesListItemRef = useRef<HTMLDivElement>(null)

    useEffect(
        () => {
            if (messagesListItemRef.current && allImagesLoaded && stickerLoaded) {
                setWidth(messagesListItemRef.current.getBoundingClientRect().width);
                setHeight(messagesListItemRef.current.getBoundingClientRect().height);

                if (!messageCardDimensionsCache[messageId]) {
                    messageCardDimensionsCache[messageId] = {
                        width: width!,
                        height: height!
                    }
                }
            }
        }, [allImagesLoaded, stickerLoaded, messageId, width, height]
    );

    useEffect(() => {
        return () => {
            if (onVisibilityChange) {
                onVisibilityChange(false);
            }
        }
    });

    const sender = findMessageSenderFunction
        ? findMessageSenderFunction(message.sender)
        : findUser(message.sender);
    const createAtLabel = !scheduledMessage
        ? getCreatedAtLabel(message.createdAt, dateFnsLocale)
        : getScheduledAtLabel(message.scheduledAt!, dateFnsLocale, l);
    const senderChatRole = message.senderRoleId && findChatRole(message.senderRoleId);
    const color = randomColor({seed: sender.id});
    const avatarLetter = `${sender.firstName[0]}${sender.lastName ? sender.lastName[0] : ""}`;
    const sentByCurrentUser = currentUser && currentUser.id === sender.id;
    const containsCode = message.text.includes("`");
    const withAudio = message.audios.length !== 0;

    const cardClasses = clsx({
        [classes.messageCardFullWidth]: fullWidth,
        [classes.messageCard]: !fullWidth,
        [classes.messageOfCurrentUserCard]: sentByCurrentUser,
        [classes.withCode]: containsCode,
        [classes.withOneImage]: withAudio,
    });
    const wrapperClasses = clsx({
        [classes.messageListItemWrapper]: true,
        [classes.messageOfCurrentUserListItemWrapper]: sentByCurrentUser && !fullWidth,
        [classes.inverted]: inverted
    });
    const userAvatarLinkClasses = clsx({
        [classes.undecoratedLink]: true,
        [classes.avatarOfCurrentUserContainer]: sentByCurrentUser,
        [classes.avatarContainer]: !sentByCurrentUser
    });

    const handleMenuItemClick = (menuItemType: MessageMenuItemType | ScheduledMessageMenuItemType): void => {
        if (onMenuItemClick) {
            onMenuItemClick(menuItemType);
        }
    };

    const handleVisibilityChange = (visible: boolean): void => {
        if (visible && !message.readByCurrentUser) {
            addMessageToQueue(message.id);
        }

        if (onVisibilityChange) {
            onVisibilityChange(visible);
        }
    }

    return (
        <ReactVisibilitySensor onChange={handleVisibilityChange}
                               partialVisibility={Boolean(messagesListHeight && height && height > messagesListHeight)}
        >
            <div className={wrapperClasses}
                 id={`message-${messageId}`}
            >
                <Link store={routerStore}
                      className={userAvatarLinkClasses}
                      view={Routes.userPage}
                      params={{slug: sender.slug || sender.id}}
                >
                    <Avatar avatarLetter={avatarLetter}
                            avatarColor={color}
                            avatarId={sender.avatarId}
                            avatarUri={sender.externalAvatarUri}
                    />
                </Link>
                <Card className={cardClasses}>
                    <CardHeader title={
                       <div className={classes.messageSender}>
                           <Link store={routerStore}
                                 className={classes.undecoratedLink}
                                 view={Routes.userPage}
                                 params={{slug: sender.slug || sender.id}}
                           >
                               <Typography variant="body1" style={{color}}>
                                   <strong>{sender.firstName} {sender.lastName && sender.lastName}</strong>
                               </Typography>
                           </Link>
                           {senderChatRole && senderChatRole.features.showRoleNameInMessages.enabled && (
                               <Typography variant="caption" color="textSecondary" className={classes.senderChatRole}>
                                   {getChatRoleTranslation(senderChatRole.name, l)}
                               </Typography>
                           )}
                       </div>
                    }
                                classes={{
                                    root: classes.cardHeaderRoot,
                                    action: classes.cardHeaderAction,
                                    content: classes.cardHeaderContent
                                }}
                                action={menu
                                    ? menu
                                    : scheduledMessage
                                        ? <ScheduledMessageMenu messageId={messageId} onMenuItemClick={handleMenuItemClick}/>
                                        : <MessageMenu messageId={messageId} onMenuItemClick={handleMenuItemClick}/>
                                }
                    />
                    <CardContent classes={{
                        root: classes.cardContentRoot
                    }}
                                 ref={messagesListItemRef}
                                 style={messageCardDimensionsCache[messageId] && messageCardDimensionsCache[messageId]}
                    >
                        <ReferredMessageContent messageId={message.referredMessageId}/>
                        {message.deleted
                            ? (
                                <div className={classes.cardContentWithPadding}>
                                    <i>{l("message.deleted")}</i>
                                </div>
                            )
                            : (
                                <Fragment>
                                    <div className={classes.cardContentWithPadding}>
                                        <MarkdownTextWithEmoji text={message.text}
                                                               emojiData={message.emoji}
                                                               uniqueId={messageId}
                                        />
                                    </div>
                                    {message.stickerId && (
                                        <MessageSticker stickerId={message.stickerId}
                                                        messageId={message.id}
                                                        onImageLoaded={() => setStickerLoaded(true)}
                                        />
                                    )}
                                    {!hideAttachments && message.images.length !== 0 && (
                                        <MessageImagesGrid imagesIds={message.images}
                                                           parentWidth={width}
                                                           messageId={messageId}
                                                           onImagesLoaded={() => setAllImagesLoaded(true)}
                                        />
                                    )}
                                    {!hideAttachments && message.audios.length !== 0 && (
                                        <MessageAudios audios={message.audios}/>
                                    )}
                                    {!hideAttachments && message.files.length !== 0 && (
                                        <MessageFiles chatUploadIds={message.files}/>
                                    )}
                                </Fragment>
                            )
                        }
                    </CardContent>
                    <CardActions classes={{
                        root: classes.cardActionsRoot
                    }}>
                        <Typography variant="caption" color="textSecondary">
                            {scheduledMessage && <Event fontSize="inherit"/>}
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
    );
});

export const MessagesListItem = memo(_MessagesListItem);
