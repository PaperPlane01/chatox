import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {IconButton, Tooltip} from "@material-ui/core";
import {Edit} from "@material-ui/icons";
import {useLocalization, useStore} from "../../store";

interface UpdateChatBlockingButtonProps {
    chatBlockingId: string
}

export const UpdateChatBlockingButton: FunctionComponent<UpdateChatBlockingButtonProps> = observer(({chatBlockingId}) => {
    const {
        updateChatBlocking: {
            setUpdateChatBlockingDialogOpen,
            setChatBlocking
        }
    } = useStore();
    const {l} = useLocalization();

    const handleClick = (): void => {
        setChatBlocking(chatBlockingId);
        setUpdateChatBlockingDialogOpen(true);
    };

    return (
        <Tooltip title={l("chat.blocking.edit")}>
            <IconButton onClick={handleClick}>
                <Edit/>
            </IconButton>
        </Tooltip>
    )
});
