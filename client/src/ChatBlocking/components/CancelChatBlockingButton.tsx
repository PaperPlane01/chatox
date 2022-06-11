import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {CircularProgress, IconButton, Tooltip} from "@mui/material";
import {Cancel} from "@mui/icons-material";
import {useLocalization, useStore} from "../../store";

interface CancelChatBlockingButtonProps {
    chatBlockingId: string
}

export const CancelChatBlockingButton: FunctionComponent<CancelChatBlockingButtonProps> = observer(({chatBlockingId}) => {
    const {
        cancelChatBlocking: {
            cancelChatBlocking,
            isChatBlockingCancellationPending
        }
    } = useStore();
    const {l} = useLocalization();

    if (isChatBlockingCancellationPending(chatBlockingId)) {
        return <CircularProgress size={24} color="primary"/>
    }

    return (
        <Tooltip title={l("cancel")}>
            <IconButton onClick={() => cancelChatBlocking(chatBlockingId)} size="large">
                <Cancel/>
            </IconButton>
        </Tooltip>
    );
});
