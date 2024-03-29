import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Badge, CardHeader, Divider, ListItem, Theme, Typography} from "@mui/material";
import {createStyles, makeStyles} from "@mui/styles";
import randomColor from "randomcolor";
import {Link} from "mobx-router";
import {ChatListMessagePreview} from "./ChatListMessagePreview";
import {TypingIndicator} from "./TypingIndicator";
import {getAvatarLabel, getChatLinkProps} from "../utils";
import {ChatLinkPropsGenerationStrategy} from "../types";
import {Avatar} from "../../Avatar";
import {useRouter, useStore} from "../../store";
import {ChatType} from "../../api/types/response";
import {getUserAvatarLabel, getUserDisplayedName} from "../../User/utils/labels";
import {useLuminosity} from "../../utils/hooks";

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
        top: "60%"
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
        entities: {
            chats: {
                findById: findChat
            },
            users: {
                findById: findUser
            }
        },
        typingUsers: {
            hasTypingUsers
        }
    } = useStore();
    const routerStore = useRouter();
    const classes = useStyles();
    const chat = findChat(chatId);
    const chatUser = chat.type === ChatType.DIALOG && chat.userId && findUser(chat.userId);
    const selected = selectedChatId === chatId;
    const linkProps = getChatLinkProps(linkGenerationStrategy, {chat, messageId});
    const chatHasTypingUsers = hasTypingUsers(chatId);
    const luminosity = useLuminosity();
    const color = randomColor({
        seed: chatUser ? chatUser.id : chatId,
        luminosity
    });

    const avatar = chatUser
        ? (
            <Avatar avatarLetter={getUserAvatarLabel(chatUser)}
                    avatarColor={color}
                    avatarUri={chatUser.externalAvatarUri}
                    avatarId={chatUser.avatarId}
            />
        )
        : (
            <Avatar avatarLetter={getAvatarLabel(chat.name)}
                    avatarColor={color}
                    avatarUri={chat.avatarUri}
                    avatarId={chat.avatarId}
            />
        );

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
                       hidden={chat.unreadMessagesCount === 0}
                >
                    <CardHeader title={
                        <div className={classes.flexWrapper}>
                            <div className={classes.flexTruncatedTextContainer}>
                                <Typography className={classes.truncatedText}>
                                    <strong>
                                        {chatUser ? getUserDisplayedName(chatUser) : chat.name}
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
                                avatar={avatar}
                                classes={{
                                    root: classes.listItemHeaderRoot,
                                    content: classes.listItemHeaderContent
                                }}
                    />
                    <Divider/>
                </Badge>
            </ListItem>
        </Link>
    );
});
