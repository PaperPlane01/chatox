import React, {FunctionComponent} from "react";
import {inject, observer} from "mobx-react";
import {createStyles, ListItemIcon, ListItemText, makeStyles, MenuItem} from "@material-ui/core";
import {PersonOutlined} from "@material-ui/icons";
import {localized, Localized} from "../../localization";
import {Routes} from "../../router";
import {CurrentUser} from "../../api/types/response";
import {MapMobxToProps} from "../../store";

const {Link} = require("mobx-router");

interface ProfileMenuItemMobxProps {
    currentUser?: CurrentUser,
    routerStore?: any
}

interface ProfileMenuItemOwnProps {
    onClick?: () => void
}

type ProfileMenuItemProps = ProfileMenuItemMobxProps & ProfileMenuItemOwnProps & Localized;

const useStyles = makeStyles(() => createStyles({
    undecoratedLink: {
        textDecoration: "none",
        color: "inherit"
    }
}));

const _ProfileMenuItem: FunctionComponent<ProfileMenuItemProps> = ({
    currentUser,
    routerStore,
    l,
    onClick
}) => {
    const classes = useStyles();

    const handleClick = (): void => {
        if (onClick) {
            onClick();
        }
    };

    if (currentUser) {
        return (
            <Link store={routerStore}
                  className={classes.undecoratedLink}
                  view={Routes.userPage}
                  params={{slug: currentUser.slug || currentUser.id}}
            >
                <MenuItem onClick={handleClick}>
                    <ListItemIcon>
                        <PersonOutlined/>
                    </ListItemIcon>
                    <ListItemText>
                        {l("user.profile")}
                    </ListItemText>
                </MenuItem>
            </Link>
        )
    } else {
        return null;
    }
};

const mapMoxToProps: MapMobxToProps<ProfileMenuItemMobxProps> = ({authorization, store}) => ({
    currentUser: authorization.currentUser,
    routerStore: store
});

export const ProfileMenuItem = localized(
    inject(mapMoxToProps)(observer(_ProfileMenuItem))
) as FunctionComponent<ProfileMenuItemOwnProps>;
