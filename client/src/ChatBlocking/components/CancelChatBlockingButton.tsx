import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {CircularProgress, IconButton, Tooltip} from "@material-ui/core";
import {Cancel} from "@material-ui/icons";
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
            <IconButton onClick={() => cancelChatBlocking(chatBlockingId)}>
                <Cancel/>
            </IconButton>
        </Tooltip>
    )
});
