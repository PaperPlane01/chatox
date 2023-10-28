import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {ListItemIcon, ListItemText, MenuItem} from "@mui/material";
import {AdminPanelSettings} from "@mui/icons-material";
import {useLocalization, useRouter, useStore} from "../../store";
import {Routes} from "../../router";

interface ChatManagementMenuItemProps {
    onClick: () => void
}

export const ChatManagementMenuItem: FunctionComponent<ChatManagementMenuItemProps> = observer(({
    onClick
}) => {
    const {
        chat: {
            selectedChat
        }
    } = useStore();
    const {l} = useLocalization();
    const router = useRouter();

    if (!selectedChat) {
        return null;
    }

    const handleClick = (): void => {
        if (onClick) {
            onClick();
        }

        router.goTo(Routes.chatManagement, {slug: selectedChat.slug || selectedChat.id});
    };

    return (
        <MenuItem onClick={handleClick}>
            <ListItemIcon>
                <AdminPanelSettings/>
            </ListItemIcon>
            <ListItemText>
                {l("chat.management")}
            </ListItemText>
        </MenuItem>
    );
});
