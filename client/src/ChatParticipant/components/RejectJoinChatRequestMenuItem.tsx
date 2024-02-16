import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {ListItemIcon, ListItemText, MenuItem} from "@mui/material";
import {Cancel} from "@mui/icons-material";
import {useLocalization, useStore} from "../../store";

interface RejectJoinChatRequestMenuItemProps {
    requestId: string,
    onClick?: () => void
}

export const RejectJoinChatRequestMenuItem: FunctionComponent<RejectJoinChatRequestMenuItemProps> = observer(({
    requestId,
    onClick
}) => {
    const {
        joinChatRequestsRejection: {
            rejectSingleJoinChatRequest
        }
    } = useStore();
    const {l} = useLocalization();

    const handleClick = (): void => {
        if (onClick) {
            onClick();
        }

        rejectSingleJoinChatRequest(requestId);
    };

    return (
        <MenuItem onClick={handleClick}>
            <ListItemIcon>
                <Cancel/>
            </ListItemIcon>
            <ListItemText>
                {l("chat.join.request.reject")}
            </ListItemText>
        </MenuItem>
    );
});

