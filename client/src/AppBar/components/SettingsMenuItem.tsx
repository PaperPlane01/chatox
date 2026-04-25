import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {ListItemIcon, ListItemText, MenuItem} from "@mui/material";
import {makeStyles} from "tss-react/mui";
import {Settings} from "@mui/icons-material";
import {Link} from "mobx-router";
import {commonStyles} from "../../style";
import {Routes} from "../../router";
import {useLocalization, useRouter} from "../../store";

interface SettingsMenuItemProps {
    onClick?: () => void
}

const useStyles = makeStyles()(() => ({
    undecoratedLink: commonStyles.undecoratedLink
}));

export const SettingsMenuItem: FunctionComponent<SettingsMenuItemProps> = observer(({onClick}) => {
    const {classes} = useStyles();
    const {l} = useLocalization();
    const routerStore = useRouter();

    const handleClick = (): void => {
        if (onClick) {
            onClick();
        }
    };

    return (
        <Link className={classes.undecoratedLink}
              router={routerStore}
              route={Routes.settingsPage}
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
