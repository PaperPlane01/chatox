import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {ListItemIcon, ListItemText, MenuItem} from "@mui/material";
import {Block} from "@mui/icons-material";
import {useLocalization, useStore} from "../../store";

interface BlockUserInChatByIdOrSlugMenuItemProps {
    onClick?: () => void
}

export const BlockUserInChatByIdOrSlugMenuItem: FunctionComponent<BlockUserInChatByIdOrSlugMenuItemProps> = observer(({
    onClick
}) => {
    const {l} = useLocalization();
    const {
        blockUserInChatByIdOrSlug: {
            setBlockUserInChatByIdOrSlugDialogOpen
        }
    } = useStore();

    const handleClick = (): void => {
        if (onClick) {
            onClick();
        }

        setBlockUserInChatByIdOrSlugDialogOpen(true);
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
    );
});
