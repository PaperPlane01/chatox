import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {ListItemIcon, ListItemText, MenuItem} from "@material-ui/core";
import {Block} from "@material-ui/icons";
import {useLocalization, useStore} from "../../store";

interface BlockChatParticipantMenuItemProps {
    userId: string,
    onClick?: () => void
}

export const BlockChatParticipantMenuItem: FunctionComponent<BlockChatParticipantMenuItemProps> = observer(({
    userId,
    onClick
}) => {
    const {l} = useLocalization();
    const {
        createChatBlocking: {
            setCreateChatBlockingDialogOpen,
            setFormValue
        }
    } = useStore();

    const setBlockedUserId = (id: string): void => setFormValue("blockedUserId", id);

    const handleClick = (): void => {
        if (onClick) {
            onClick();
        }

        setBlockedUserId(userId);
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
