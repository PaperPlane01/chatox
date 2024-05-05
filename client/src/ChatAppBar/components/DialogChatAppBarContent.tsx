import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {CardHeader, Typography, useMediaQuery, useTheme} from "@mui/material";
import {createStyles, makeStyles} from "@mui/styles";
import randomColor from "randomcolor";
import {ChatAppBarSearchInput} from "./ChatAppBarSearchInput";
import {TypingIndicator} from "../../Chat";
import {Avatar} from "../../Avatar";
import {getOnlineOrLastSeenLabel, getUserAvatarLabel, getUserDisplayedName} from "../../User/utils/labels";
import {useLocalization, useStore} from "../../store";
import {useEntityById} from "../../entities";
import {trimString} from "../../utils/string-utils";
import {useLuminosity} from "../../utils/hooks";

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
        messagesSearch: {
            showInput
        },
        typingUsers: {
            hasTypingUsers
        }
    } = useStore();
    const {l, dateFnsLocale} = useLocalization();
    const classes = useStyles();
    const theme = useTheme();
    const onSmallScreen = useMediaQuery(theme.breakpoints.down("md"));
    const chat = useEntityById("chats", !showInput ? chatId : undefined);
    const user = useEntityById("users", chat?.userId);
    const luminosity = useLuminosity();

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
                                <Avatar avatarLetter={getUserAvatarLabel(user)}
                                        avatarColor={randomColor({seed: user.id, luminosity})}
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
