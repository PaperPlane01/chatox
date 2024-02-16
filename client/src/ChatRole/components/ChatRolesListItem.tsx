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
        }
    } = useStore();
    const {l} = useLocalization();

    const chatRole = findChatRole(chatRoleId);

    const handleClick = (): void => {
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
