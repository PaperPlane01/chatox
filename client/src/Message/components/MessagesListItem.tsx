import React, {Fragment, FunctionComponent, MouseEvent, ReactNode, useEffect, useRef, useState} from "react";
import {observer} from "mobx-react";
import {Card, CardActions, CardContent, CardHeader, lighten, Theme, Tooltip, Typography} from "@mui/material";
import {createStyles, makeStyles} from "@mui/styles";
import {Edit, Event, Forward, Done, DoneAll} from "@mui/icons-material";
import {format, isBefore, isEqual, isSameDay, isSameYear, Locale} from "date-fns";
import randomColor from "randomcolor";
import ReactVisibilitySensor from "react-visibility-sensor";
import clsx from "clsx";
import {Link} from "mobx-router";
import {MessageMenu, MessageMenuItemType} from "./MessageMenu";
import {ScheduledMessageMenu, ScheduledMessageMenuItemType} from "./ScheduledMessageMenu";
import {MessageImagesGrid} from "./MessageImagesGrid";
import {ReferredMessageContent} from "./ReferredMessageContent";
import {MessageAudios} from "./MessageAudios";
import {MessageFiles} from "./MessageFiles";
import {MessageSticker} from "./MessageSticker";
import {SelectMessageForForwardingRadioButton} from "./SelectMessageForForwardingRadioButton";
import {MessageEntity} from "../types";
import {Avatar} from "../../Avatar";
import {useAuthorization, useEntities, useLocalization, useRouter, useStore} from "../../store";
import {Routes} from "../../router";
import {MarkdownTextWithEmoji} from "../../Markdown";
import {TranslationFunction} from "../../localization";
import {UserEntity} from "../../User";
import {getChatRoleTranslation} from "../../ChatRole/utils";
import {ensureEventWontPropagate} from "../../utils/event-utils";
import {useLuminosity} from "../../utils/hooks";
import {commonStyles} from "../../style";
import {UploadType} from "../../api/types/response";
import {isDefined} from "../../utils/object-utils";

interface MessagesListItemProps {
    messageId: string,
    lastMessageReadByAnyoneCreatedAt?: Date,
    fullWidth?: boolean,
    onMenuItemClick?: (menuItemType: MessageMenuItemType | ScheduledMessageMenuItemType) => void,
    onVisibilityChange?: (visible: boolean) => void,
    hideAttachments?: boolean,
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
        overflowX: "auto",
        transition: "none"
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
        ...commonStyles.undecoratedLink,
    },
    zeroHeight: {
        height: 0
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
    messageSender: {
        display: "flex"
    },
    senderChatRole: {
        paddingLeft: theme.spacing(1),
        paddingTop: theme.spacing(0.5)
    },
    partiallyVirtualized: {
        contentVisibility: "auto",
        containIntrinsicSize: "auto 160px"
    },
    selectedForForwarding: {
        backgroundColor: lighten(theme.palette.primary.light, 0.5)
    },
    messageBottomText: {
        display: "flex",
        alignItems: "center",
        gap: theme.spacing(0.5)
    }
}));

let messageCardDimensionsCache: {[messageId: string]: {width: number, height: number}} = {};

window.addEventListener("resize", () => messageCardDimensionsCache = {});

//TODO: Refactor this mess into smaller components
export const MessagesListItem: FunctionComponent<MessagesListItemProps> = observer(({
    messageId,
    lastMessageReadByAnyoneCreatedAt,
    fullWidth = false,
    onMenuItemClick,
    onVisibilityChange,
    hideAttachments = false,
    messagesListHeight,
    scheduledMessage = false,
    findMessageFunction,
    findMessageSenderFunction,
    menu
}) => {
    const {
        markMessageRead: {
            addMessageToQueue
        },
        chatsPreferences: {
            enableVirtualScroll,
            enablePartialVirtualization
        },
        messagesForwarding: {
            forwardModeActive,
            isMessageForwarded,
            forwardedFromChatId,
            addMessage,
            removeMessage
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
    const messageSelectedForForwarding = !scheduledMessage && forwardModeActive && isMessageForwarded(messageId);
    const luminosity = useLuminosity();

    useEffect(
        () => {
            setTimeout(() => {
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
            }, 300);
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
    const forwardedBy = message.forwardedById
        ? findMessageSenderFunction ? findMessageSenderFunction(message.forwardedById) : findUser(message.forwardedById)
        : undefined;
    const createAtLabel = !scheduledMessage
        ? getCreatedAtLabel(message.createdAt, dateFnsLocale)
        : getScheduledAtLabel(message.scheduledAt!, dateFnsLocale, l);
    const senderChatRole = message.senderRoleId && findChatRole(message.senderRoleId);
    const color = randomColor({seed: sender.id, luminosity});
    const avatarLetter = `${sender.firstName[0]}${sender.lastName ? sender.lastName[0] : ""}`;
    const sentByCurrentUser = currentUser && isDefined(message.forwardedById)
        ? message.forwardedById === currentUser.id
        : message.sender === currentUser?.id;
    const containsCode = message.text.includes("`");
    const withAudio = message.audios.length !== 0
        || message.voiceMessages.length !== 0;
    const readByAnyone = message.readByAnyone || (isDefined(lastMessageReadByAnyoneCreatedAt)
        && (isEqual(message.createdAt, lastMessageReadByAnyoneCreatedAt)
            || isBefore(message.createdAt, lastMessageReadByAnyoneCreatedAt)));

    const cardClasses = clsx({
        [classes.messageCardFullWidth]: fullWidth,
        [classes.messageCard]: !fullWidth,
        [classes.messageOfCurrentUserCard]: sentByCurrentUser,
        [classes.withCode]: containsCode,
        [classes.withOneImage]: withAudio
    });
    const wrapperClasses = clsx({
        [classes.messageListItemWrapper]: true,
        [classes.messageOfCurrentUserListItemWrapper]: sentByCurrentUser && !fullWidth,
        [classes.partiallyVirtualized]: !enableVirtualScroll && enablePartialVirtualization,
        [classes.selectedForForwarding]: messageSelectedForForwarding
    });
    const userAvatarLinkClasses = clsx({
        [classes.undecoratedLink]: true,
        [classes.zeroHeight]: true,
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
    };

    const handleClick = (event: MouseEvent<HTMLDivElement>): void => {
        if (!forwardModeActive) {
            return;
        }

        ensureEventWontPropagate(event);

        if (isMessageForwarded(messageId)) {
            removeMessage(messageId);
        } else {
            addMessage(messageId);
        }
    };

    return (
        <ReactVisibilitySensor onChange={handleVisibilityChange}
                               partialVisibility={Boolean(messagesListHeight && height && height > messagesListHeight)}
        >
            <div className={wrapperClasses}
                 id={`message-${messageId}`}
                 onClick={handleClick}
            >
                {(forwardModeActive && forwardedFromChatId === message.chatId)
                    ? (
                        <SelectMessageForForwardingRadioButton selected={messageSelectedForForwarding}
                                                               messageId={messageId}
                                                               className={userAvatarLinkClasses}
                        />
                    )
                    : (
                        <Link router={routerStore}
                              className={userAvatarLinkClasses}
                              route={Routes.userPage}
                              params={{slug: sender.slug || sender.id}}
                        >
                            <Avatar avatarLetter={avatarLetter}
                                    avatarColor={color}
                                    avatarId={sender.avatarId}
                                    avatarUri={sender.externalAvatarUri}
                            />
                        </Link>
                    )
                }
                <Card className={cardClasses}>
                    <CardHeader title={
                       <div className={classes.messageSender}>
                           <Link router={routerStore}
                                 className={classes.undecoratedLink}
                                 route={Routes.userPage}
                                 params={{slug: sender.slug || sender.id}}
                           >
                               {message.forwarded && (
                                   <Typography variant="body1"
                                               style={{
                                                   color,
                                                   paddingBottom: 0,
                                                   display: "flex"
                                               }}
                                   >
                                       <Forward/>
                                       {l("message.forwarded")}:
                                   </Typography>
                               )}
                               <Typography variant="body1" style={{color}}>
                                   <strong>{sender.firstName} {sender.lastName && sender.lastName}</strong>
                                   {forwardedBy && (
                                       <strong>
                                           {l("message.forwarded.by")}
                                           {" "}
                                           {forwardedBy.firstName} {forwardedBy.lastName && forwardedBy.lastName}
                                       </strong>
                                   )}
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
                        <ReferredMessageContent messageId={message.referredMessageId}
                                                findMessageFunction={findMessageFunction}
                                                findSenderFunction={findMessageSenderFunction}
                        />
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
                                        <MessageAudios audios={message.audios}
                                                       audioType={UploadType.AUDIO}
                                        />
                                    )}
                                    {!hideAttachments && message.voiceMessages.length !== 0 && (
                                        <MessageAudios audios={message.voiceMessages}
                                                       audioType={UploadType.VOICE_MESSAGE}
                                        />
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
                        <Typography variant="caption"
                                    color="textSecondary"
                                    className={classes.messageBottomText}
                        >
                            {scheduledMessage && <Event fontSize="inherit"/>}
                            {createAtLabel}
                            {message.updatedAt && (
                                <Tooltip title={l(
                                    "message.updated-at",
                                    {updatedAt: getCreatedAtLabel(message.updatedAt, dateFnsLocale)}
                                )}>
                                <span>
                                    ,
                                    {" "}
                                    <Edit fontSize="inherit"/>
                                    {l("message.edited")}
                                </span>
                                </Tooltip>
                            )}
                            {sentByCurrentUser && (
                                readByAnyone
                                    ? <DoneAll fontSize="small" color="primary"/>
                                    : <Done fontSize="small" color="primary"/>
                            )}
                        </Typography>
                    </CardActions>
                </Card>
            </div>
        </ReactVisibilitySensor>
    );
});
