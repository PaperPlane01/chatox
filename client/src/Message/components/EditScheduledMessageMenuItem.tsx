import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {MenuItem, ListItemIcon, ListItemText} from "@mui/material";
import {Edit} from "@mui/icons-material";
import {useLocalization, useStore} from "../../store";

interface EditScheduledMessageMenuItemProps {
    messageId: string,
    onClick?: () => void
}

export const EditScheduledMessageMenuItem: FunctionComponent<EditScheduledMessageMenuItemProps> = observer(({
    messageId,
    onClick
}) => {
    const {
        updateScheduledMessage: {
            setUpdateMessageDialogOpen,
            setMessageId
        }
    } = useStore();
    const {l} = useLocalization();

    const handleClick = (): void => {
        if (onClick) {
            onClick();
        }

        setMessageId(messageId);
        setUpdateMessageDialogOpen(true);
    };

    return (
        <MenuItem onClick={handleClick}>
            <ListItemIcon>
                <Edit/>
            </ListItemIcon>
            <ListItemText>
                {l("edit")}
            </ListItemText>
        </MenuItem>
    );
});
