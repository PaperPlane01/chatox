import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {ListItemIcon, ListItemText, MenuItem} from "@mui/material";
import {Block} from "@mui/icons-material";
import {useLocalization, useStore} from "../../store";
import {useEntityById} from "../../entities";

interface BlockMessageAuthorInChatMenuItemProps {
    onClick?: () => void,
    messageId: string
}

export const BlockMessageAuthorInChatMenuItem: FunctionComponent<BlockMessageAuthorInChatMenuItemProps> = observer(({
    onClick,
    messageId
}) => {
    const {
        createChatBlocking: {
            setFormValue,
            setCreateChatBlockingDialogOpen
        }
    } = useStore();
    const {l} = useLocalization();

    const message = useEntityById("messages", messageId);
    const user = useEntityById("users", message.sender);

    const setBlockedUserId = (id: string): void => setFormValue("blockedUserId", id);

    const handleClick = (): void => {
        if (onClick) {
            onClick();
        }

        setBlockedUserId(user.id);
        setCreateChatBlockingDialogOpen(true);
    };

    return (
        <MenuItem onClick={handleClick}>
            <ListItemIcon>
                <Block/>
            </ListItemIcon>
            <ListItemText>
                {l("chat.blocking.block-user")}
            </ListItemText>
        </MenuItem>
    )
});
