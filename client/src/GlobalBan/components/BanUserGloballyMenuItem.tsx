import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {MenuItem, ListItemIcon, ListItemText} from "@material-ui/core";
import {RemoveCircle} from "@material-ui/icons";
import {useStore, useLocalization} from "../../store/hooks";

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
    )
});