import React, {FunctionComponent, MouseEvent} from "react";
import {observer} from "mobx-react";
import {MenuItem, ListItemText} from "@mui/material";
import {useStore, useLocalization} from "../../store";

interface ClosePinnedMessageMenuItemProps {
    messageId: string,
    onClick?: (event: MouseEvent) => void
}

export const ClosePinnedMessageMenuItem: FunctionComponent<ClosePinnedMessageMenuItemProps> = observer(({
    messageId,
    onClick
}) => {
    const {
        closedPinnedMessages: {
            closePinnedMessage
        }
    } = useStore();
    const {l} = useLocalization();

    const handleClick = (event: MouseEvent): void => {
        if (onClick) {
            onClick(event);
        }

        closePinnedMessage(messageId);
    };

    return (
        <MenuItem onClick={handleClick}>
            <ListItemText>
                {l("close")}
            </ListItemText>
        </MenuItem>
    );
});
