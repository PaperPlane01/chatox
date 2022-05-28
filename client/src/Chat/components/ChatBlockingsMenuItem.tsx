import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {ListItemIcon, ListItemText, MenuItem} from "@mui/material";
import {AssignmentInd} from "@mui/icons-material";
import {useLocalization, useStore} from "../../store";

interface ChatBlockingsMenuItemProps {
    onClick?: () => void
}

export const ChatBlockingsMenuItem: FunctionComponent<ChatBlockingsMenuItemProps> = observer(({
    onClick
}) => {
    const {
        chatBlockingsOfChat: {
            fetchChatBlockings
        },
        chatBlockingsDialog: {
            setChatBlockingsDialogOpen
        }
    } = useStore();
    const {l} = useLocalization();

    const handleClick = (): void => {
        if (onClick) {
            onClick();
        }

        fetchChatBlockings({abortIfInitiallyFetched: true});
        setChatBlockingsDialogOpen(true);
    };

    return (
        <MenuItem onClick={handleClick}>
            <ListItemIcon>
                <AssignmentInd/>
            </ListItemIcon>
            <ListItemText>
                {l("chat.blocking.blocked-users")}
            </ListItemText>
        </MenuItem>
    );
});
