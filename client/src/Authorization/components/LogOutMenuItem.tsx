import React, {FunctionComponent} from "react";
import {inject, observer} from "mobx-react";
import {MenuItem, ListItemIcon, ListItemText} from "@material-ui/core";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";
import {localized, Localized} from "../../localization";
import {IAppState} from "../../store";

interface LogOutMenuItemOwnProps {
    onClick?: () => void
}

interface LogOutMenuItemMobxProps {
    logOut: () => void
}

type LogOutMenuItemProps = LogOutMenuItemOwnProps & LogOutMenuItemMobxProps & Localized;

const _LogOutMenuItem: FunctionComponent<LogOutMenuItemProps> = ({
    onClick,
    logOut,
    l
}) => {
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
};

const mapMobxToProps = (state: IAppState): LogOutMenuItemMobxProps => ({
    logOut: state.authorization.logOut
});

export const LogOutMenuItem = inject(mapMobxToProps)(observer(localized(_LogOutMenuItem)) as FunctionComponent<LogOutMenuItemOwnProps>);
