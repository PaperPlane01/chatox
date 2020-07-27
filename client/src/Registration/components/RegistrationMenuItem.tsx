import React, {FunctionComponent} from "react";
import {inject, observer} from "mobx-react";
import {MenuItem, ListItemIcon, ListItemText} from "@material-ui/core";
import PersonAddIcon from "@material-ui/icons/PersonAdd";
import {localized, Localized} from "../../localization";
import {IAppState} from "../../store";

interface RegistrationMenuItemOwnProps {
    onClick?: () => void
}

interface RegistrationMenuItemMobxProps {
    setRegistrationDialogOpen: (registrationDialogOpen: boolean) => void
}

type RegistrationMenuItemProps = RegistrationMenuItemMobxProps & RegistrationMenuItemOwnProps & Localized;

const _RegistrationMenuItem: FunctionComponent<RegistrationMenuItemProps> = ({
    onClick,
    setRegistrationDialogOpen,
    l
}) => {
    const handleClick = (): void => {
        if (onClick) {
            onClick()
        }

        setRegistrationDialogOpen(true);
    };

    return (
        <MenuItem onClick={handleClick}>
            <ListItemIcon>
                <PersonAddIcon/>
            </ListItemIcon>
            <ListItemText>
                {l("register")}
            </ListItemText>
        </MenuItem>
    )
};

const mapMobxToProps = (state: IAppState): RegistrationMenuItemMobxProps => ({
    setRegistrationDialogOpen: state.registrationDialog.setRegistrationDialogOpen
});

export const RegistrationMenuItem = localized(
    inject(mapMobxToProps)(observer(_RegistrationMenuItem))
) as FunctionComponent<RegistrationMenuItemOwnProps>;
