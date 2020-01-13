import React, {FunctionComponent} from "react";
import {inject, observer} from "mobx-react";
import {MenuItem, ListItemIcon, ListItemText} from "@material-ui/core";
import PersonIcon from "@material-ui/icons/Person";
import {localized, Localized} from "../../localization";
import {IAppState} from "../../store";

interface LoginMenuItemMobxProps {
    setLoginDialogOpen: (loginDialogOpen: boolean) => void
}

interface LoginMenuItemOwnProps {
    onClick?: () => void
}

type LoginMenuItemProps = LoginMenuItemMobxProps & LoginMenuItemOwnProps & Localized;

const _LoginMenuItem: FunctionComponent<LoginMenuItemProps> = ({
    setLoginDialogOpen,
    onClick,
    l
}) => {
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
};

const mapMobxToProps = (state: IAppState): LoginMenuItemMobxProps => ({
    setLoginDialogOpen: state.login.setLoginDialogOpen
});

export const LoginMenuItem = inject(mapMobxToProps)(observer(localized(_LoginMenuItem)) as FunctionComponent<{}>);
