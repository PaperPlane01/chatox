import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {ListItemIcon, ListItemText, MenuItem} from "@material-ui/core";
import {Edit} from "@material-ui/icons";
import {useLocalization, useStore} from "../../store";

interface EditChatMenuItemProps {
    onClick?: () => void
}

export const EditChatMenuItem: FunctionComponent<EditChatMenuItemProps> = observer(({onClick}) => {
    const {
        chatUpdate: {
            setUpdateChatDialogOpen
        }
    } = useStore();
    const {l} = useLocalization();

    const handleClick = (): void => {
        if (onClick) {
            onClick();
        }

        setUpdateChatDialogOpen(true);
    };

    return (
        <MenuItem onClick={handleClick}>
            <ListItemIcon>
                <Edit/>
            </ListItemIcon>
            <ListItemText>
                {l("chat.edit")}
            </ListItemText>
        </MenuItem>
    )
});
