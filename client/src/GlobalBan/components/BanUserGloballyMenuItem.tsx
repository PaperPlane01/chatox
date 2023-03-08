import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {MenuItem, ListItemIcon, ListItemText} from "@mui/material";
import {RemoveCircle} from "@mui/icons-material";
import {useStore, useLocalization} from "../../store";

interface BanUserGloballyMenuItemProps {
    userId: string,
    onClick?: () => void
}

export const BanUserGloballyMenuItem: FunctionComponent<BanUserGloballyMenuItemProps> = observer(({
    userId,
    onClick
}) => {
    const {
        userGlobalBan: {
            setBanUserDialogOpen,
            setBannedUserId
        }
    } = useStore();
    const {l} = useLocalization();

    const handleClick = () => {
        setBannedUserId(userId);
        setBanUserDialogOpen(true);

        if (onClick) {
            onClick();
        }
    };

    return (
        <MenuItem onClick={handleClick}>
            <ListItemIcon>
                <RemoveCircle/>
            </ListItemIcon>
            <ListItemText>
                {l("global.ban.create")}
            </ListItemText>
        </MenuItem>
    );
});