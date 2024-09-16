import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {CardHeader, Typography, useMediaQuery, useTheme} from "@mui/material";
import {createStyles, makeStyles} from "@mui/styles";
import randomColor from "randomcolor";
import {ChatAppBarSearchInput} from "./ChatAppBarSearchInput";
import {ChatMenu, TypingIndicator} from "../../Chat";
import {getAvatarLabel} from "../../Chat/utils";
import {useLocalization, useStore} from "../../store";
import {useEntityById} from "../../entities";
import {trimString} from "../../utils/string-utils";
import {Avatar} from "../../Avatar";

interface GroupChatAppBarContentProps {
    chatId: string
}

const useStyles = makeStyles(() => createStyles({
    cardHeaderRoot: {
        padding: 0
    }
}));

export const GroupChatAppBarContent: FunctionComponent<GroupChatAppBarContentProps> = observer(({
    chatId
}) => {
    const {
        onlineChatParticipants: {
            onlineParticipantsCount
        },
        chatInfoDialog: {
            setChatInfoDialogOpen
        },
        messagesSearch: {
            showInput
        },
        typingUsers: {
            hasTypingUsers
        }
    } = useStore();
    const {l} = useLocalization();
    const classes = useStyles();
    const theme = useTheme();
    const onSmallScreen = useMediaQuery(theme.breakpoints.down("lg"));
    const chatHasTypingUsers = hasTypingUsers(chatId);
    const chat = useEntityById("chats", chatId);

    if (showInput) {
        return <ChatAppBarSearchInput/>
    } else {
        return (
            <CardHeader title={(
                <div style={{display: "flex"}}>
                    <Typography variant="body1"
                                style={{cursor: "pointer"}}
                                onClick={() => setChatInfoDialogOpen(true)}
                    >
                        {onSmallScreen ? trimString(chat.name, 25) : chat.name}
                    </Typography>
                </div>
            )}
                        subheader={(
                            <Typography variant="body2"
                                        style={{
                                            opacity: 0.5,
                                            cursor: "pointer",
                                            display: "flex"
                                        }}
                                        onClick={() => setChatInfoDialogOpen(true)}
                            >
                                {chatHasTypingUsers
                                    ? <TypingIndicator chatId={chatId}/>
                                    :  l(
                                        "chat.number-of-participants",
                                        {numberOfParticipants: chat.participantsCount, onlineParticipantsCount: `${onlineParticipantsCount}`}
                                    )
                                }
                            </Typography>
                        )}
                        avatar={(
                            <div style={{cursor: "pointer"}}
                                 onClick={() => setChatInfoDialogOpen(true)}
                            >
                                <Avatar avatarLetter={getAvatarLabel(chat.name)}
                                        avatarColor={randomColor({seed: chat.id})}
                                        avatarUri={chat.avatarUri}
                                        avatarId={chat.avatarId}
                                />
                            </div>
                        )}
                        action={
                            <ChatMenu/>
                        }
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
