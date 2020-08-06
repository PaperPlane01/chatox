import React, {FunctionComponent} from "react";
import {inject, observer} from "mobx-react";
import {MenuItem, ListItemIcon, ListItemText, createStyles, makeStyles} from "@material-ui/core";
import {Settings} from "@material-ui/icons";
import {localized, Localized} from "../../localization";
import {Routes} from "../../router";
import {MapMobxToProps} from "../../store";

const {Link} = require("mobx-router");

interface SettingsMenuItemMobxProps {
    routerStore?: any
}

interface SettingsMenuItemOwnProps {
    onClick?: () => void
}

type SettingsMenuItemProps = SettingsMenuItemMobxProps & SettingsMenuItemOwnProps & Localized;

const useStyles = makeStyles(() => createStyles({
    undecoratedLink: {
        textDecoration: "none",
        color: "inherit"
    }
}));

const _SettingsMenuItem: FunctionComponent<SettingsMenuItemProps> = ({
    onClick,
    routerStore,
    l
}) => {
    const classes = useStyles();

    const handleClick = (): void => {
        if (onClick) {
            onClick();
        }
    };

    return (
        <Link className={classes.undecoratedLink}
              view={Routes.settingsPage}
              store={routerStore}
        >
            <MenuItem onClick={handleClick}>
                <ListItemIcon>
                    <Settings/>
                </ListItemIcon>
                <ListItemText>
                    {l("settings")}
                </ListItemText>
            </MenuItem>
        </Link>
    )
};

const mapMoxToProps: MapMobxToProps<SettingsMenuItemMobxProps> = ({store}) => ({
    routerStore: store
});

export const SettingsMenuItem = localized(
    inject(mapMoxToProps)(observer(_SettingsMenuItem))
) as FunctionComponent<SettingsMenuItemOwnProps>;
