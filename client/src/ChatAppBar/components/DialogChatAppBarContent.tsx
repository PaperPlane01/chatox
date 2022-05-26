import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {CardHeader, createStyles, makeStyles, Typography, useMediaQuery, useTheme} from "@material-ui/core";
import randomColor from "randomcolor";
import {Avatar} from "../../Avatar";
import {getOnlineOrLastSeenLabel, getUserAvatarLabel, getUserDisplayedName} from "../../User/utils/labels";
import {useLocalization, useStore} from "../../store";
import {trimString} from "../../utils/string-utils";
import {ChatAppBarSearchInput} from "./ChatAppBarSearchInput";

interface DialogChatAppBarContentProps {
    chatId: string
}

const useStyles = makeStyles(() => createStyles({
    cardHeaderRoot: {
        padding: 0
    }
}));

export const DialogChatAppBarContent: FunctionComponent<DialogChatAppBarContentProps> = observer(({
    chatId
}) => {
    const {
        entities: {
            chats: {
                findById: findChat
            },
            users: {
                findById: findUser
            }
        },
        messagesSearch: {
            showInput
        }
    } = useStore();
    const {l, dateFnsLocale} = useLocalization();
    const classes = useStyles();
    const theme = useTheme();
    const onSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

    if (showInput) {
        return (
            <ChatAppBarSearchInput/>
        );
    } else {
        const chat = findChat(chatId);
        const user = findUser(chat.userId!);

        return (
            <CardHeader title={(
                <div style={{display: "flex"}}>
                    <Typography variant="body1"
                                style={{cursor: "pointer"}}
                    >
                        {onSmallScreen ? trimString(getUserDisplayedName(user), 25) : getUserDisplayedName(user)}
                    </Typography>
                </div>
            )}
                        subheader={getOnlineOrLastSeenLabel(
                            user,
                            dateFnsLocale,
                            l,
                            {
                                variant: "body2",
                                style: {
                                    opacity: user.online ? 1 : 0.5,
                                    cursor: "pointer"
                                }
                            }
                        )}
                        avatar={(
                            <div>
                                <Avatar avatarLetter={getUserAvatarLabel(user)}
                                        avatarColor={randomColor({seed: user.id})}
                                        avatarUri={user.externalAvatarUri}
                                        avatarId={user.avatarId}
                                />
                            </div>
                        )}
                        style={{
                            width: "100%"
                        }}
                        classes={{
                            root: classes.cardHeaderRoot
                        }}
            />
        );
    }
});
