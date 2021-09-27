import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Badge, CardHeader, createStyles, Divider, ListItem, makeStyles, Theme, Typography} from "@material-ui/core";
import randomColor from "randomcolor";
import {LastMessagePreview} from "./LastMessagePreview";
import {getAvatarLabel} from "../utils";
import {Avatar} from "../../Avatar";
import {useRouter, useStore} from "../../store";
import {Routes} from "../../router";
import {ChatType} from "../../api/types/response";
import {getUserAvatarLabel, getUserDisplayedName} from "../../User/utils/labels";

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
        paddingRight: theme.spacing(2)
    },
    selected: {
        [theme.breakpoints.up("lg")]: {
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.getContrastText(theme.palette.primary.main)
        }
    },
    listItemHeaderRoot: {
        [theme.breakpoints.down("md")]: {
            padding: theme.spacing(2),
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
            users: {
                findById: findUser
            }
        }
    } = useStore();
    const routerStore = useRouter();
    const classes = useStyles();
    const chat = findChat(chatId);
    const chatUser = chat.type === ChatType.DIALOG && chat.userId && findUser(chat.userId);
    const selected = selectedChatId === chatId;

    const avatar = chatUser
        ? (
            <Avatar avatarLetter={getUserAvatarLabel(chatUser)}
                    avatarColor={randomColor({seed: chatUser.id})}
                    avatarUri={chatUser.externalAvatarUri}
                    avatarId={chatUser.avatarId}
            />
        )
        : (
            <Avatar avatarLetter={getAvatarLabel(chat.name)}
                    avatarColor={randomColor({seed: chatId})}
                    avatarUri={chat.avatarUri}
                    avatarId={chat.avatarId}
            />
        );

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
                                    <strong>
                                        {chatUser ? getUserDisplayedName(chatUser) : chat.name}
                                    </strong>
                                </Typography>
                            </div>
                        </div>

                    }
                                subheader={chat.lastMessage && (
                                    <div className={classes.flexWrapper}>
                                        <div className={classes.flexTruncatedTextContainer}>
                                            <Typography className={`${classes.flexTruncatedText} ${selected && classes.selected}`}>
                                                <LastMessagePreview messageId={chat.lastMessage}/>
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
