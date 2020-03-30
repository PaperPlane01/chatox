import React, {FunctionComponent} from "react";
import {inject} from "mobx-react";
import {MenuItem, ListItemIcon, ListItemText, createStyles, makeStyles} from "@material-ui/core";
import HomeIcon from "@material-ui/icons/Home";
import {Routes} from "../../router";
import {localized, Localized} from "../../localization";
import {MapMobxToProps} from "../../store";

const {Link} = require("mobx-router");

interface HomeMenuItemMobxProps {
    routerStore?: any
}

interface HomeMenuItemOwnProps {
    onClick?: () => void
}

type HomeMenuItemProps = HomeMenuItemMobxProps & HomeMenuItemOwnProps & Localized;

const useStyles = makeStyles(() => createStyles({
    undecoratedLink: {
        textDecoration: "none",
        color: "inherit"
    }
}));

const _HomeMenuItem: FunctionComponent<HomeMenuItemProps> = ({
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
        <Link view={Routes.home}
              store={routerStore}
              className={classes.undecoratedLink}
        >
            <MenuItem onClick={handleClick}>
                <ListItemIcon>
                    <HomeIcon/>
                </ListItemIcon>
                <ListItemText>
                    {l("home")}
                </ListItemText>
            </MenuItem>
        </Link>
    )
};

const mapMobxToProps: MapMobxToProps<HomeMenuItemMobxProps> = ({store}) => ({
    routerStore: store
});

export const HomeMenuItem = localized(
    inject(mapMobxToProps)(_HomeMenuItem)
) as FunctionComponent<HomeMenuItemOwnProps>;
