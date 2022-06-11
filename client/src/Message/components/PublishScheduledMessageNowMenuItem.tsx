import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {MenuItem, ListItemIcon, ListItemText, CircularProgress} from "@mui/material";
import {Send} from "@mui/icons-material";
import {useLocalization, useStore} from "../../store";

interface SendScheduledMessageNowMenuItemProps {
    messageId: string,
    onClick?: () => void
}

export const PublishScheduledMessageNowMenuItem: FunctionComponent<SendScheduledMessageNowMenuItemProps> = observer(({
    messageId,
    onClick
}) => {
    const {
        publishScheduledMessage: {
            pendingMessagesMap,
            publishScheduledMessage
        }
    } = useStore();
    const {l} = useLocalization();

    const handleClick = (): void => {
        if (pendingMessagesMap[messageId]) {
            return;
        }

        if (onClick) {
            onClick();
        }

        publishScheduledMessage(messageId);
    };

    return (
        <MenuItem onClick={handleClick}
                  disabled={pendingMessagesMap[messageId]}
        >
            <ListItemIcon>
                {pendingMessagesMap[messageId] ? <CircularProgress color="primary" size={15}/> : <Send/>}
            </ListItemIcon>
            <ListItemText>
                {l("message.delayed-message.publish")}
            </ListItemText>
        </MenuItem>
    );
});
