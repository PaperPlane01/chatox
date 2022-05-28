import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {MenuItem, ListItemIcon, ListItemText} from "@mui/material";
import {Delete} from "@mui/icons-material";
import {useLocalization, useStore} from "../../store";

interface DeleteMessageMenuItemProps {
    messageId: string,
    onClick?: () => void
}

export const DeleteMessageMenuItem: FunctionComponent<DeleteMessageMenuItemProps> = observer(({
    messageId,
    onClick
}) => {
    const {
        messageDeletion: {
            deleteMessage
        }
    } = useStore();
    const {l} = useLocalization();

    const handleClick = (): void => {
        if (onClick) {
            onClick();
        }

        deleteMessage(messageId);
    }

    return (
        <MenuItem onClick={handleClick}>
            <ListItemIcon>
                <Delete/>
            </ListItemIcon>
            <ListItemText>
                {l("common.delete")}
            </ListItemText>
        </MenuItem>
    );
});
