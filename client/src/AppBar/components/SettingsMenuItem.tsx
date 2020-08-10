import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {createStyles, ListItemIcon, ListItemText, makeStyles, MenuItem} from "@material-ui/core";
import {Settings} from "@material-ui/icons";
import {Routes} from "../../router";
import {useLocalization, useRouter} from "../../store";

const {Link} = require("mobx-router");

interface SettingsMenuItemProps {
    onClick?: () => void
}

const useStyles = makeStyles(() => createStyles({
    undecoratedLink: {
        textDecoration: "none",
        color: "inherit"
    }
}));

export const SettingsMenuItem: FunctionComponent<SettingsMenuItemProps> = observer(({onClick}) => {
    const classes = useStyles();
    const {l} = useLocalization();
    const routerStore = useRouter();

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
});
