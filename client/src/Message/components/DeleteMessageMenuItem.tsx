import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {MenuItem, ListItemIcon, ListItemText} from "@material-ui/core";
import {Delete} from "@material-ui/icons";
import {useLocalization, useStore} from "../../store/hooks";

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
