import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {MenuItem, ListItemIcon, ListItemText} from "@mui/material";
import {Edit} from "@mui/icons-material";
import {useLocalization, useStore} from "../../store";

interface UpdateGlobalBanMenuItemProps {
    globalBanId: string,
    onClick?: () => void
}

export const UpdateGlobalBanMenuItem: FunctionComponent<UpdateGlobalBanMenuItemProps> = observer(({
    onClick,
    globalBanId
}) => {
    const {
        updateGlobalBan: {
            setUpdatedGlobalBanId,
            setUpdateGlobalBanDialogOpen
        }
    } = useStore();
    const {l} = useLocalization();

    const handleClick = (): void => {
        if (onClick) {
            onClick();
        }

        setUpdatedGlobalBanId(globalBanId);
        setUpdateGlobalBanDialogOpen(true);
    };

    return (
        <MenuItem onClick={handleClick}>
            <ListItemIcon>
                <Edit/>
            </ListItemIcon>
            <ListItemText>
                {l("edit")}
            </ListItemText>
        </MenuItem>
    );
});
