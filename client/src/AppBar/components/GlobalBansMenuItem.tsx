import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {MenuItem, ListItemIcon, ListItemText} from "@mui/material";
import {createStyles, makeStyles} from "@mui/styles";
import {RemoveCircle} from "@mui/icons-material";
import {Link} from "mobx-router";
import {useLocalization, useRouter} from "../../store";
import {Routes} from "../../router";

interface GlobalBansMenuItemProps {
    onClick?: () => void
}

const useStyles = makeStyles(() => createStyles({
    undecoratedLink: {
        textDecoration: "none",
        color: "inherit"
    }
}));

export const GlobalBansMenuItem: FunctionComponent<GlobalBansMenuItemProps> = observer(({onClick}) => {
    const {l} = useLocalization();
    const routerStore = useRouter();
    const classes = useStyles();

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
