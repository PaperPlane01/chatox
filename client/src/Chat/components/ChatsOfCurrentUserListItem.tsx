import React, {Fragment, FunctionComponent, ReactNode} from "react";
import {observer} from "mobx-react";
import {Badge, CardHeader, createStyles, Divider, ListItem, makeStyles, Theme, Typography} from "@material-ui/core";
import {Audiotrack, FileCopy, Image, VideoLibrary} from "@material-ui/icons";
import randomColor from "randomcolor";
import {ChatUploadEntity} from "../types";
import {getAvatarLabel} from "../utils";
import {Avatar} from "../../Avatar";
import {useLocalization, useRouter, useStore} from "../../store";
import {Routes} from "../../router";
import {useEmojiParser, ParseEmojiFunction} from "../../Emoji";
import {upperCaseFirstLetter} from "../../utils/string-utils";
import {MessageEntity} from "../../Message/types";
import {Labels, TranslationFunction} from "../../localization";
import {UserEntity} from "../../User/types";
import {Upload, UploadType} from "../../api/types/response";

const {Link} = require("mobx-router");

interface ChatsOfCurrentUserListItemProps {
    chatId: string
}

const useStyles = makeStyles((theme: Theme) => createStyles({
    chatsOfCurrentUserListItem: {
        cursor: "pointer",
        overflow: "hidden"
    },
    gutters: {
        paddingLeft: 0,
        paddingRight: 16
    },
    selected: {
        [theme.breakpoints.up("lg")]: {
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.getContrastText(theme.palette.primary.main)
        }
    },
    listItemHeaderRoot: {
        [theme.breakpoints.down("md")]: {
            padding: 16,
            paddingLeft: 0
        },
        maxWidth: "100%"
    },
    listItemHeaderContent: {
        maxWidth: "80%"
    },
    flexWrapper: {
        display: "flex",
    },
    flexTruncatedTextContainer: {
        flex: 1,
        minWidth: 0
    },
    flexTruncatedText: {
        whiteSpace: "nowrap",
        textOverflow: "ellipsis",
        overflow: "hidden"
    },
    unreadMessagesBadgeRoot: {
        [theme.breakpoints.down("md")]: {
            width: "100%"
        },
        maxWidth: "100%"
    },
    unreadMessagesBadgeTopRightRectangle: {
        [theme.breakpoints.down("md")]: {
            top: "50%"
        },
        [theme.breakpoints.up("lg")]: {
            "top": "100%"
        }
    },
    undecoratedLink: {
        textDecoration: "none",
        color: "inherit"
    }
}));

interface GetLastMessageTextParameters {
    message: MessageEntity,
    messageSender: UserEntity,
    messageUploads: Upload<any>[],
    l: TranslationFunction,
    parseEmoji: ParseEmojiFunction
}

type GetLastMessageTextFunction = (parameters: GetLastMessageTextParameters) => ReactNode

const getSingularOrPluralLabel = (count: number, singularLabel: keyof Labels): keyof Labels => {
    if (count > 1) {
        return `${singularLabel}.plural` as keyof Labels;
    } else {
        return singularLabel;
    }
}

const getLastMessageText: GetLastMessageTextFunction = ({
    message,
    messageSender,
    messageUploads,
    parseEmoji,
    l
}): ReactNode => {
    if (message.deleted) {
        return <i>{l("message.deleted")}</i>
    }

    const messageSenderName = messageSender.firstName;

    if (message.text && message.text.length !== 0) {
        return (
            <Fragment>
                {messageSenderName}
                {": "}
                {parseEmoji(message.text, message.emoji)}
            </Fragment>
        )
    }

    if (messageUploads.length !== 0) {
        if (messageUploads.length === 1) {
            const upload = messageUploads[0];
            let uploadDisplay: ReactNode;

            switch (upload.type) {
                case UploadType.IMAGE:
                case UploadType.GIF:
                    uploadDisplay = (
                        <Fragment>
                            <Image fontSize="inherit"/>
                            {" "}
                            {upperCaseFirstLetter(l("message.attachments.image"))}
                        </Fragment>
                    );
                    break;
                case UploadType.FILE:
                default:
                    uploadDisplay = (
                        <Fragment>
                            <FileCopy fontSize="inherit"/>
                            {" "}
                            {upperCaseFirstLetter(l("message.attachments.file"))}
                        </Fragment>
                    );
                    break;
                case UploadType.VIDEO:
                    uploadDisplay = (
                        <Fragment>
                            <VideoLibrary fontSize="inherit"/>
                            {" "}
                            {upperCaseFirstLetter(l("message.attachments.video"))}
                        </Fragment>
                    );
                    break;
                case UploadType.AUDIO:
                    uploadDisplay = (
                        <Fragment>
                            <Audiotrack fontSize="inherit"/>
                            {" "}
                            {upperCaseFirstLetter(l("message.attachments.audio"))}
                        </Fragment>
                    )
            }

            return (
                <Fragment>
                    {messageSenderName}
                    {": "}
                    {uploadDisplay}
                </Fragment>
            );
        } else {
            const imagesText = message.imagesCount !== 0
                ? `${message.imagesCount} ${l(getSingularOrPluralLabel(message.imagesCount, "message.attachments.image"))}`
                : "";
            const videosText = message.videosCount !== 0
                ? `${message.videosCount} ${l(getSingularOrPluralLabel(message.videosCount, "message.attachments.video"))}`
                : "";
            const audiosText = message.audiosCount !== 0
                ? `${message.audiosCount} ${l(getSingularOrPluralLabel(message.audiosCount, "message.attachments.audio"))}`
                : "";
            const filesText = message.filesCount !== 0
                ? `${message.filesCount} ${l(getSingularOrPluralLabel(message.filesCount, "message.attachments.file"))}`
                : "";
            let attachmentsText = [imagesText, videosText, audiosText, filesText]
                .filter(text => text !== "")
                .reduce((left, right) => `${left}, ${right}`)
            attachmentsText = `[${attachmentsText}]`;

            return  (
                <Fragment>
                    {messageSenderName}
                    {": "}
                    {attachmentsText}
                </Fragment>
            )
        }
    }
}

export const ChatsOfCurrentUserListItem: FunctionComponent<ChatsOfCurrentUserListItemProps> = observer(({
    chatId
}) => {
    const {
        chat: {
            selectedChatId
        },
        entities: {
            chats: {
                findById: findChat
            },
            messages: {
                findById: findMessage
            },
            users: {
                findById: findUser
            },
            uploads: {
                findAllById: findUploads,
            }
        }
    } = useStore();
    const routerStore = useRouter();
    const {l} = useLocalization();
    const classes = useStyles();
    const {parseEmoji} = useEmojiParser();
    const chat = findChat(chatId);
    const lastMessage = chat.lastMessage && findMessage(chat.lastMessage);
    const lastMessageSender = lastMessage && findUser(lastMessage.sender);
    const selected = selectedChatId === chatId;
    const lastMessageUploads = lastMessage
        ? findUploads(lastMessage.uploads)
        : []

    return (
        <Link store={routerStore}
              view={Routes.chatPage}
              params={{slug: chat.slug || chat.id}}
              className={classes.undecoratedLink}
        >
            <ListItem className={`${classes.chatsOfCurrentUserListItem} ${selected && classes.selected}`}
                      classes={{
                          gutters: classes.gutters
                      }}
            >
                <Badge badgeContent={chat.unreadMessagesCount}
                       color="secondary"
                       classes={{
                           root: classes.unreadMessagesBadgeRoot,
                           anchorOriginTopRightRectangle: classes.unreadMessagesBadgeTopRightRectangle
                       }}
                       hidden={chat.unreadMessagesCount === 0}
                >
                    <CardHeader title={
                        <div className={classes.flexWrapper}>
                            <div className={classes.flexTruncatedTextContainer}>
                                <Typography className={classes.flexTruncatedText}>
                                    <strong>{chat.name}</strong>
                                </Typography>
                            </div>
                        </div>

                    }
                                subheader={lastMessage && lastMessageSender && (
                                    <div className={classes.flexWrapper}>
                                        <div className={classes.flexTruncatedTextContainer}>
                                            <Typography className={`${classes.flexTruncatedText} ${selected && classes.selected}`}>
                                                {getLastMessageText({
                                                    message: lastMessage,
                                                    messageUploads: lastMessageUploads,
                                                    messageSender: lastMessageSender,
                                                    parseEmoji,
                                                    l
                                                })}
                                            </Typography>
                                        </div>
                                    </div>
                                )}
                                avatar={<Avatar avatarLetter={getAvatarLabel(chat.name)}
                                                avatarColor={randomColor({seed: chatId})}
                                                avatarUri={chat.avatarUri}
                                                avatarId={chat.avatarId}
                                />}
                                classes={{
                                    root: classes.listItemHeaderRoot,
                                    content: classes.listItemHeaderContent
                                }}
                    />
                    <Divider/>
                </Badge>
            </ListItem>
        </Link>
    )
});
