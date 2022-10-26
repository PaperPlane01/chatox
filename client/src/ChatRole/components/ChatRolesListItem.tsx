import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {MenuItem, ListItemText} from "@mui/material";
import {getChatRoleTranslation} from "../utils";
import {useStore, useLocalization} from "../../store";

interface ChatRolesListItemProps {
    chatRoleId: string
}

export const ChatRolesListItem: FunctionComponent<ChatRolesListItemProps> = observer(({chatRoleId}) => {
    const {
        entities: {
            chatRoles: {
                findById: findChatRole
            }
        },
        chatRoleInfo: {
            setRoleId
        },
        rolesOfChats: {
            setChatRolesDialogOpen
        }
    } = useStore();
    const {l} = useLocalization();

    const chatRole = findChatRole(chatRoleId);

    const handleClick = (): void => {
        setChatRolesDialogOpen(false);
        setRoleId(chatRoleId);
    };

    return (
        <MenuItem onClick={handleClick}>
            <ListItemText>
                {getChatRoleTranslation(chatRole.name, l)} ({chatRole.level})
            </ListItemText>
        </MenuItem>
    );
});
