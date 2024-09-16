import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {ListItemIcon, ListItemText, MenuItem} from "@mui/material";
import {ExitToApp} from "@mui/icons-material";
import {useLocalization, useStore} from "../../store";
import {useEntityById} from "../../entities";

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
        }
    } = useStore();
    const {l} = useLocalization();
    const chat = useEntityById("chats", selectedChatId);

    if (!chat) {
        return null;
    }

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
