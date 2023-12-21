import React, {FunctionComponent, MouseEvent} from "react";
import {observer} from "mobx-react";
import {IconButton} from "@mui/material";
import {Edit} from "@mui/icons-material";
import {useStore} from "../../store";
import {ensureEventWontPropagate} from "../../utils/event-utils";

interface EditChatInviteButtonProps {
    chatInviteId: string
}

export const EditChatInviteButton: FunctionComponent<EditChatInviteButtonProps> = observer(({
    chatInviteId
}) => {
    const {
        chatInviteUpdate: {
            setChatInviteId,
            setUpdateChatInviteDialogOpen
        }
    } = useStore();

    const handleClick = (event: MouseEvent<HTMLButtonElement>): void => {
        ensureEventWontPropagate(event);
        setChatInviteId(chatInviteId);
        setUpdateChatInviteDialogOpen(true);
    };

    return (
        <IconButton onClick={handleClick}>
            <Edit/>
        </IconButton>
    );
});
