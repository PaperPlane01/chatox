import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {MenuItem, ListItemIcon, ListItemText} from "@material-ui/core";
import {Edit} from "@material-ui/icons";
import {useLocalization, useStore} from "../../store/hooks";

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
    )
})
