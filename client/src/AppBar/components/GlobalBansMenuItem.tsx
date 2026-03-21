import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {MenuItem, ListItemIcon, ListItemText} from "@mui/material";
import {makeStyles} from "tss-react/mui";
import {RemoveCircle} from "@mui/icons-material";
import {Link} from "mobx-router";
import {commonStyles} from "../../style";
import {useLocalization, useRouter} from "../../store";
import {Routes} from "../../router";

interface GlobalBansMenuItemProps {
    onClick?: () => void
}

const useStyles = makeStyles()(() => ({
    undecoratedLink: commonStyles.undecoratedLink,
}));

export const GlobalBansMenuItem: FunctionComponent<GlobalBansMenuItemProps> = observer(({onClick}) => {
    const {l} = useLocalization();
    const routerStore = useRouter();
    const {classes} = useStyles();

    const handleClick = (): void => {
        if (onClick) {
            onClick();
        }
    };

    return (
        <Link route={Routes.globalBans}
              router={routerStore}
              className={classes.undecoratedLink}
        >
            <MenuItem onClick={handleClick}>
                <ListItemIcon>
                    <RemoveCircle/>
                </ListItemIcon>
                <ListItemText>
                    {l("global.bans")}
                </ListItemText>
            </MenuItem>
        </Link>
    );
});
