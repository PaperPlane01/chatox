import React, {Fragment, FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Badge, CardHeader, createStyles, Divider, ListItem, makeStyles, Theme, Typography} from "@material-ui/core";
import randomColor from "randomcolor";
import {getAvatarLabel} from "../utils";
import {Avatar} from "../../Avatar";
import {useLocalization, useRouter, useStore} from "../../store";
import {Routes} from "../../router";
import {useEmojiParser} from "../../emoji/hooks";

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
                                                {lastMessage.deleted
                                                    ? <i>{l("message.deleted")}</i>
                                                    : (
                                                        <Fragment>
                                                            {lastMessageSender.firstName}
                                                            {": "}
                                                            {parseEmoji(lastMessage.text, lastMessage.emoji)}
                                                        </Fragment>
                                                    )
                                                }
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
