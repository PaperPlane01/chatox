import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {ListItemIcon, ListItemText, MenuItem} from "@material-ui/core";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";
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
                <ExitToAppIcon/>
            </ListItemIcon>
            <ListItemText>
                {l("logout")}
            </ListItemText>
        </MenuItem>
    )
});
