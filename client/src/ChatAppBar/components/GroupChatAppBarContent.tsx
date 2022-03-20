import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {CardHeader, createStyles, makeStyles, Typography, useMediaQuery, useTheme} from "@material-ui/core";
import randomColor from "randomcolor";
import {ChatMenu} from "../../Chat";
import {getAvatarLabel} from "../../Chat/utils";
import {useLocalization, useStore} from "../../store";
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
        entities: {
            chats: {
                findById: findChat
            }
        },
        onlineChatParticipants: {
            onlineParticipantsCount
        },
        chatInfoDialog: {
            setChatInfoDialogOpen
        }
    } = useStore();
    const {l} = useLocalization();
    const classes = useStyles();
    const theme = useTheme();
    const onSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

    const chat = findChat(chatId);

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
                                            cursor: "pointer"
                                        }}
                                        onClick={() => setChatInfoDialogOpen(true)}
                            >
                                {l(
                                    "chat.number-of-participants",
                                    {numberOfParticipants: chat.participantsCount, onlineParticipantsCount: `${onlineParticipantsCount}`}
                                )}
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
});
