import React, {Fragment, FunctionComponent} from "react";
import {observer} from "mobx-react";
import {CircularProgress, IconButton, Menu} from "@mui/material";
import {MoreVert} from "@mui/icons-material";
import {bindMenu, bindToggle, usePopupState} from "material-ui-popup-state/hooks";
import {ApproveJoinChatRequestMenuItem} from "./ApproveJoinChatRequestMenuItem";
import {RejectJoinChatRequestMenuItem} from "./RejectJoinChatRequestMenuItem";
import {useStore} from "../../store";
import {ensureEventWontPropagate} from "../../utils/event-utils";

interface JoinChatRequestMenuProps {
    requestId: string
}

export const JoinChatRequestMenu: FunctionComponent<JoinChatRequestMenuProps> = observer(({
    requestId
}) => {
    const {
        joinChatRequestsApproval: {
            isApprovalPending
        },
        joinChatRequestsRejection: {
            isRejectionPending
        }
    } = useStore();
    const joinChatRequestMenuPopupState = usePopupState({
        popupId: `joinChatRequestMenu-${requestId}`,
        variant: "popover"
    });
    const joinChatRequestMenuButtonProps = bindToggle(joinChatRequestMenuPopupState);
    const originalClickHandler = joinChatRequestMenuButtonProps.onClick;
    joinChatRequestMenuButtonProps.onClick = event => {
        originalClickHandler(event);
        ensureEventWontPropagate(event);
    };

    const pending = isApprovalPending(requestId) || isRejectionPending(requestId);

    if (pending) {
        return <CircularProgress size={10} color="primary"/>;
    }

    return (
        <Fragment>
            <IconButton {...joinChatRequestMenuButtonProps}>
                <MoreVert/>
            </IconButton>
            <Menu {...bindMenu(joinChatRequestMenuPopupState)}>
                <ApproveJoinChatRequestMenuItem requestId={requestId}
                                                onClick={joinChatRequestMenuPopupState.close}
                />
                <RejectJoinChatRequestMenuItem requestId={requestId}
                                               onClick={joinChatRequestMenuPopupState.close}
                />
            </Menu>
        </Fragment>
    );
});
