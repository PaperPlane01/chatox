import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {ListItemIcon, ListItemText, MenuItem} from "@mui/material";
import {CheckCircle} from "@mui/icons-material";
import {useLocalization, useStore} from "../../store";

interface ApproveJoinChatRequestMenuItemProps {
    requestId: string,
    onClick?: () => void
}

export const ApproveJoinChatRequestMenuItem: FunctionComponent<ApproveJoinChatRequestMenuItemProps> = observer(({
    requestId,
    onClick
}) => {
    const {
        joinChatRequestsApproval: {
            approveSingleJoinChatRequest
        }
    } = useStore();
    const {l} = useLocalization();

    const handleClick = (): void => {
        if (onClick) {
            onClick();
        }

        approveSingleJoinChatRequest(requestId);
    };

    return (
        <MenuItem onClick={handleClick}>
            <ListItemIcon>
                <CheckCircle/>
            </ListItemIcon>
            <ListItemText>
                {l("chat.join.request.approve")}
            </ListItemText>
        </MenuItem>
    );
});
