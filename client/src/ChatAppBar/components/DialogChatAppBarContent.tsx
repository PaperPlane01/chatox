import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {CardHeader, Typography, useMediaQuery, useTheme} from "@mui/material";
import {makeStyles} from "tss-react/mui";
import {ChatAppBarSearchInput} from "./ChatAppBarSearchInput";
import {TypingIndicator} from "../../Chat/components";
import {getOnlineOrLastSeenLabel, getUserDisplayedName} from "../../User/utils/labels";
import {useLocalization, useStore} from "../../store/hooks";
import {useEntityById} from "../../entities";
import {trimString} from "../../utils/string-utils";
import {UserAvatar} from "../../UserAvatar/components";

interface DialogChatAppBarContentProps {
    chatId: string
}

const useStyles = makeStyles()(() => ({
    cardHeaderRoot: {
        padding: 0
    }
}));

export const DialogChatAppBarContent: FunctionComponent<DialogChatAppBarContentProps> = observer(({
    chatId
}) => {
    const {
        messagesSearch: {
            showInput
        },
        typingUsers: {
            hasTypingUsers
        }
    } = useStore();
    const {l, dateFnsLocale} = useLocalization();
    const {classes} = useStyles();
    const theme = useTheme();
    const onSmallScreen = useMediaQuery(theme.breakpoints.down("md"));
    const chat = useEntityById("chats", showInput ? undefined : chatId);
    const user = useEntityById("users", chat?.userId);

    if (showInput) {
        return <ChatAppBarSearchInput/>;
    } else if (!chat || !user) {
        return null;
    } else {
        const username = getUserDisplayedName(user);
        const chatHasTypingUsers = hasTypingUsers(chatId);

        const chatSubheader = chatHasTypingUsers
            ? <TypingIndicator chatId={chatId}/>
            : getOnlineOrLastSeenLabel(
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
            );

        return (
            <CardHeader title={(
                <div style={{display: "flex"}}>
                    <Typography variant="body1"
                                style={{cursor: "pointer"}}
                    >
                        {onSmallScreen ? trimString(username, 25) : username}
                    </Typography>
                </div>
            )}
                        subheader={chatSubheader}
                        avatar={(
                            <div>
                                <UserAvatar user={user}/>
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
