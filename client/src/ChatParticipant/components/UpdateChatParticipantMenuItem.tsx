import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {MenuItem, ListItemIcon, ListItemText} from "@mui/material";
import {SupervisedUserCircle} from "@mui/icons-material";
import {useLocalization, useStore} from "../../store";

interface UpdateChatParticipantMenuItemProps {
    chatParticipantId: string,
    onClick?: () => void
}

export const UpdateChatParticipantMenuItem: FunctionComponent<UpdateChatParticipantMenuItemProps> = observer(({
    chatParticipantId,
    onClick
}) => {
    const {
        updateChatParticipant: {
            setUpdatedParticipantId,
            setUpdateChatParticipantDialogOpen
        }
    } = useStore();
    const {l} = useLocalization();

    const handleClick = (): void => {
        if (onClick) {
            onClick();
        }

        setUpdatedParticipantId(chatParticipantId);
        setUpdateChatParticipantDialogOpen(true);
    }

    return (
        <MenuItem onClick={handleClick}>
            <ListItemIcon>
                <SupervisedUserCircle/>
            </ListItemIcon>
            <ListItemText>
                {l("chat.participant.update")}
            </ListItemText>
        </MenuItem>
    );
});
