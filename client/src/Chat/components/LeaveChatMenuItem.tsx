import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {MenuItem, ListItemIcon, ListItemText} from "@mui/material";
import {ExitToApp} from "@mui/icons-material";
import {useLocalization, useStore} from "../../store";

interface LeaveChatMenuItemProps {
    onClick?: () => void
}

export const LeaveChatMenuItem: FunctionComponent<LeaveChatMenuItemProps> = observer(({
    onClick
}) => {
    const {
        leaveChat: {
            leaveChat
        },
        chat: {
            selectedChatId
        },
        entities: {
            chats: {
                findById: findChat
            }
        }
    } = useStore();
    const {l} = useLocalization();
    const chat = findChat(selectedChatId!);

    const handleClick = (): void => {
        if (onClick) {
            onClick();
        }

        if (chat.currentUserParticipationId) {
            leaveChat(chat.id, chat.currentUserParticipationId);
        }
    }

    return (
        <MenuItem onClick={handleClick}>
            <ListItemIcon>
                <ExitToApp/>
            </ListItemIcon>
            <ListItemText>
                {l("chat.leave")}
            </ListItemText>
        </MenuItem>
    );
});
