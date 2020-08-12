import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {createStyles, ListItemIcon, ListItemText, makeStyles, MenuItem} from "@material-ui/core";
import {PersonOutlined} from "@material-ui/icons";
import {Routes} from "../../router";
import {useAuthorization, useLocalization, useRouter} from "../../store";

const {Link} = require("mobx-router");

interface ProfileMenuItemProps {
    onClick?: () => void
}

const useStyles = makeStyles(() => createStyles({
    undecoratedLink: {
        textDecoration: "none",
        color: "inherit"
    }
}));

export const ProfileMenuItem: FunctionComponent<ProfileMenuItemProps> = observer(({onClick}) => {
    const classes = useStyles();
    const {l} = useLocalization();
    const {currentUser} = useAuthorization();
    const routerStore = useRouter();

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
});
