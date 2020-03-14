import React, {FunctionComponent} from "react";
import {inject, observer} from "mobx-react";
import {Badge, CardHeader, createStyles, Divider, ListItem, makeStyles, Typography} from "@material-ui/core";
import randomColor from "randomcolor";
import {ChatOfCurrentUserEntity, MessageEntity} from "../types";
import {getAvatarLabel} from "../utils";
import {Avatar} from "../../Avatar";
import {UserEntity} from "../../User/types";
import {MapMobxToProps} from "../../store";
import {Routes} from "../../router";

const {Link} = require("mobx-router");

interface ChatsOfCurrentUserListItemMobxProps {
    selectedChat?: string,
    findChat: (id: string) => ChatOfCurrentUserEntity,
    findUser: (id: string) => UserEntity,
    findMessage: (id: string) => MessageEntity,
    routerStore?: any
}

interface ChatsOfCurrentUserListItemOwnProps {
    chatId: string
}

type ChatsOfCurrentUserListItemProps = ChatsOfCurrentUserListItemMobxProps & ChatsOfCurrentUserListItemOwnProps;

const useStyles = makeStyles(theme => createStyles({
    chatsOfCurrentUserListItem: {
        cursor: "pointer",
        overflow: "hide"
    },
    gutters: {
        paddingLeft: 0,
        paddingRight: 16
    },
    selected: {
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.getContrastText(theme.palette.primary.main)
    },
    listItemHeaderRoot: {
        [theme.breakpoints.down("md")]: {
            padding: 16,
            paddingLeft: 0
        }
    },
    listItemTitle: {
        [theme.breakpoints.up("lg")]: {
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
            overflow: "hidden",
            width: 140
        },
        [theme.breakpoints.down("md")]: {
            width: "100%"
        }
    },
    unreadMessagesBadgeRoot: {
        [theme.breakpoints.down("md")]: {
            width: "100%"
        }
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

const _ChatsOfCurrentUserListItem: FunctionComponent<ChatsOfCurrentUserListItemProps> = ({
    chatId,
    selectedChat,
    findChat,
    findUser,
    findMessage,
    routerStore
}) => {
    const classes = useStyles();
    const chat = findChat(chatId);
    const lastMessage = chat.lastMessage && findMessage(chat.lastMessage);
    const lastMessageSender = lastMessage && findUser(lastMessage.sender);
    const selected = selectedChat === chatId;

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
                        <Typography className={classes.listItemTitle}>
                            {chat.name}
                        </Typography>
                    }
                                subheader={lastMessage && lastMessageSender && (
                                    <div>
                                        {lastMessageSender.firstName}: {lastMessage.text}
                                    </div>
                                )}
                                avatar={<Avatar avatarLetter={getAvatarLabel(chat.name)}
                                                avatarColor={randomColor({seed: chatId})}
                                                avatarUri={chat.avatarUri}
                                />}
                                classes={{
                                    root: classes.listItemHeaderRoot
                                }}
                    />
                    <Divider/>
                </Badge>
            </ListItem>
        </Link>
    )
};

const mapMobxToProps: MapMobxToProps<ChatsOfCurrentUserListItemMobxProps> = ({entities, chat, store}) => ({
    findChat: entities.chats.findById,
    selectedChat: chat.selectedChatId,
    findMessage: entities.messages.findById,
    findUser: entities.users.findById,
    routerStore: store
});

export const ChatsOfCurrentUserListItem = inject(mapMobxToProps)(observer(_ChatsOfCurrentUserListItem) as FunctionComponent<ChatsOfCurrentUserListItemOwnProps>);
