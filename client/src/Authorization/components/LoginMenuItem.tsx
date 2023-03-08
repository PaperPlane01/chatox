import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {ListItemIcon, ListItemText, MenuItem} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import {useLocalization, useStore} from "../../store";

interface LoginMenuItemProps {
    onClick?: () => void
}

export const LoginMenuItem: FunctionComponent<LoginMenuItemProps> = observer(({onClick}) => {
    const {l} = useLocalization();
    const {login: {setLoginDialogOpen}} = useStore();

    const handleClick = (): void => {
        setLoginDialogOpen(true);

        if (onClick) {
            onClick();
        }
    };

    return (
        <MenuItem onClick={handleClick}>
            <ListItemIcon>
                <PersonIcon/>
            </ListItemIcon>
            <ListItemText>
                {l("login")}
            </ListItemText>
        </MenuItem>
    )
});
