import React, {FunctionComponent} from "react";
import {inject, observer} from "mobx-react";
import {IconButton, Tooltip, CircularProgress} from "@material-ui/core";
import {Cancel} from "@material-ui/icons";
import {localized, Localized} from "../../localization";
import {MapMobxToProps} from "../../store";

interface CancelChatBlockingButtonMobxProps {
    isChatBlockingCancellationPending: (chatBlockingId: string) => boolean,
    cancelChatBlocking: (id: string) => void
}

interface CancelChatBlockingButtonOwnProps {
    chatBlockingId: string
}

type CancelChatBlockingButtonProps = CancelChatBlockingButtonMobxProps & CancelChatBlockingButtonOwnProps & Localized;

const _CancelChatBlockingButton: FunctionComponent<CancelChatBlockingButtonProps> = ({
    chatBlockingId,
    cancelChatBlocking,
    isChatBlockingCancellationPending,
    l
}) => {
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
};

const mapMobxToProps: MapMobxToProps<CancelChatBlockingButtonMobxProps> = ({cancelChatBlocking}) => ({
    isChatBlockingCancellationPending: cancelChatBlocking.isChatBlockingCancellationPending,
    cancelChatBlocking: cancelChatBlocking.cancelChatBlocking
});

export const CancelChatBlockingButton = localized(
    inject(mapMobxToProps)(observer(_CancelChatBlockingButton))
) as FunctionComponent<CancelChatBlockingButtonOwnProps>;
