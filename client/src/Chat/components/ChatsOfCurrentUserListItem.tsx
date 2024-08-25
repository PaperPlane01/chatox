import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Badge, CardHeader, Divider, ListItem, Theme, Typography} from "@mui/material";
import {createStyles, makeStyles} from "@mui/styles";
import {Link} from "mobx-router";
import {ChatAvatar} from "./ChatAvatar";
import {ChatListMessagePreview} from "./ChatListMessagePreview";
import {TypingIndicator} from "./TypingIndicator";
import {getChatLinkProps} from "../utils";
import {ChatLinkPropsGenerationStrategy} from "../types";
import {useChatName} from "../hooks";
import {useRouter, useStore} from "../../store";
import {useEntityById} from "../../entities";

interface ChatsOfCurrentUserListItemProps {
    chatId: string,
    messageId?: string,
    linkGenerationStrategy?: ChatLinkPropsGenerationStrategy,
    ignoreSelection?: boolean
}

const useStyles = makeStyles((theme: Theme) => createStyles({
    chatsOfCurrentUserListItem: {
        cursor: "pointer",
        overflow: "hidden"
    },
    gutters: {
        paddingLeft: 0,
        paddingRight: theme.spacing(2)
    },
    selected: {
        [theme.breakpoints.up("lg")]: {
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.getContrastText(theme.palette.primary.main)
        }
    },
    listItemHeaderRoot: {
        [theme.breakpoints.down('xl')]: {
            padding: theme.spacing(2),
            paddingLeft: 0
        },
        maxWidth: "100%"
    },
    listItemHeaderContent: {
        maxWidth: "80%"
    },
    flexWrapper: {
        display: "flex"
    },
    flexTruncatedTextContainer: {
        flex: 1,
        minWidth: 0
    },
    truncatedText: {
        whiteSpace: "nowrap",
        textOverflow: "ellipsis",
        overflow: "hidden"
    },
    unreadMessagesBadgeRoot: {
        width: "100%"
    },
    unreadMessagesBadgeTopRightRectangle: {
        top: "70%"
    },
    unreadMentionsBadgeTopRightRectangle: {
        top: "40%"
    },
    undecoratedLink: {
        textDecoration: "none",
        color: "inherit"
    }
}));

export const ChatsOfCurrentUserListItem: FunctionComponent<ChatsOfCurrentUserListItemProps> = observer(({
    chatId,
    messageId,
    linkGenerationStrategy = "chat",
    ignoreSelection = false
}) => {
    const {
        chat: {
            selectedChatId
        },
        typingUsers: {
            hasTypingUsers
        }
    } = useStore();
    const routerStore = useRouter();
    const classes = useStyles();
    const chat = useEntityById("chats", chatId);
    const chatUser = useEntityById("users", chat.userId)
    const chatName = useChatName(chat, chatUser);

    const linkProps = getChatLinkProps(linkGenerationStrategy, {chat, messageId});
    const chatHasTypingUsers = hasTypingUsers(chatId);
    const selected = chatId === selectedChatId;

    return (
        <Link router={routerStore}
              className={classes.undecoratedLink}
              {...linkProps}
        >
            <ListItem className={`${classes.chatsOfCurrentUserListItem} ${selected && !ignoreSelection && classes.selected}`}
                      classes={{
                          gutters: classes.gutters
                      }}
            >
                <Badge badgeContent={chat.unreadMessagesCount}
                       color="secondary"
                       classes={{
                           root: classes.unreadMessagesBadgeRoot,
                           anchorOriginTopRightRectangular: classes.unreadMessagesBadgeTopRightRectangle
                       }}
                       invisible={chat.unreadMessagesCount === 0}
                       max={999}
                >
                    <Badge badgeContent={"@"}
                           color="secondary"
                           classes={{
                               root: classes.unreadMessagesBadgeRoot,
                               anchorOriginTopRightRectangular: classes.unreadMentionsBadgeTopRightRectangle
                           }}
                           invisible={chat.unreadMentionsCount === 0}
                    >
                        <CardHeader title={
                            <div className={classes.flexWrapper}>
                                <div className={classes.flexTruncatedTextContainer}>
                                    <Typography className={classes.truncatedText}>
                                        <strong>
                                            {chatName}
                                        </strong>
                                    </Typography>
                                </div>
                            </div>
                        }
                                    subheader={messageId && (
                                        <div className={classes.flexWrapper}>
                                            <div className={classes.flexTruncatedTextContainer}>
                                                <Typography className={`${classes.truncatedText} ${selected && !ignoreSelection && classes.selected}`}>
                                                    {chatHasTypingUsers
                                                        ? <TypingIndicator chatId={chatId}/>
                                                        : <ChatListMessagePreview messageId={messageId}/>
                                                    }
                                                </Typography>
                                            </div>
                                        </div>
                                    )}
                                    avatar={<ChatAvatar chat={chat} chatUser={chatUser}/>}
                                    classes={{
                                        root: classes.listItemHeaderRoot,
                                        content: classes.listItemHeaderContent
                                    }}
                        />
                        <Divider/>
                    </Badge>
                </Badge>
            </ListItem>
        </Link>
    );
});
