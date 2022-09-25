import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {MenuItem, ListItemIcon, ListItemText} from "@mui/material";
import {Badge} from "@mui/icons-material";
import {useStore, useLocalization} from "../../store";

interface ChatRolesMenuItemProps {
    onClick?: () => void
}

export const ChatRolesMenuItem: FunctionComponent<ChatRolesMenuItemProps> = observer(({
    onClick
}) => {
    const {
        rolesOfChats: {
            setChatRolesDialogOpen
        }
    } = useStore();
    const {l} = useLocalization();

    const handleClick = (): void => {
        if (onClick) {
            onClick();
        }

        setChatRolesDialogOpen(true);
    };

    return (
        <MenuItem onClick={handleClick}>
            <ListItemIcon>
                <Badge/>
            </ListItemIcon>
            <ListItemText>
                {l("chat-role.list.no-chat")}
            </ListItemText>
        </MenuItem>
    );
});