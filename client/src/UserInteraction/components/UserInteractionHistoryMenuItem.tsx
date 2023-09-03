import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {ListItemIcon, ListItemText, MenuItem} from "@mui/material";
import {Favorite} from "@mui/icons-material";
import {useLocalization, useStore} from "../../store";

interface UserInteractionHistoryMenuItemProps {
    onClick?: () => void
}

export const UserInteractionHistoryMenuItem: FunctionComponent<UserInteractionHistoryMenuItemProps> = observer(({
    onClick
}) => {
    const {
        userInteractionsHistory: {
            setUserInteractionsHistoryDialogOpen
        }
    } = useStore();
    const {l} = useLocalization();

    const handleClick = (): void => {
        if (onClick) {
            onClick();
        }

        setUserInteractionsHistoryDialogOpen(true);
    };

    return (
        <MenuItem onClick={handleClick}>
            <ListItemIcon>
                <Favorite/>
            </ListItemIcon>
            <ListItemText>
                {l("user.interaction.list")}
            </ListItemText>
        </MenuItem>
    )
})