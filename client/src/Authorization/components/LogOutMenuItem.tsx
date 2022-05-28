import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {ListItemIcon, ListItemText, MenuItem} from "@mui/material";
import {ExitToApp} from "@mui/icons-material";
import {useLocalization, useStore} from "../../store";

interface LogOutMenuItemProps {
    onClick?: () => void
}

export const LogOutMenuItem: FunctionComponent<LogOutMenuItemProps> = observer(({onClick}) => {
    const {l} = useLocalization();
    const {authorization: {logOut}} = useStore();

    const handleClick = (): void => {
        if (onClick) {
            onClick();
        }

        logOut();
    };

    return (
        <MenuItem onClick={handleClick}>
            <ListItemIcon>
                <ExitToApp/>
            </ListItemIcon>
            <ListItemText>
                {l("logout")}
            </ListItemText>
        </MenuItem>
    );
});
