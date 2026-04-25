import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {ListItemText, MenuItem} from "@mui/material";
import {getChatRoleTranslation} from "../utils";
import {useLocalization, useStore} from "../../store";
import {useEntityById} from "../../entities";

interface ChatRolesListItemProps {
    chatRoleId: string
}

export const ChatRolesListItem: FunctionComponent<ChatRolesListItemProps> = observer(({chatRoleId}) => {
    const {
        chatRoleInfo: {
            setRoleId
        }
    } = useStore();
    const {l} = useLocalization();

    const chatRole = useEntityById("chatRoles", chatRoleId);

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
