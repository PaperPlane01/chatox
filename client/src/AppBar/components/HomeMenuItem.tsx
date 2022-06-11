import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {ListItemIcon, ListItemText, MenuItem} from "@mui/material";
import {createStyles, makeStyles} from "@mui/styles";
import {Home} from "@mui/icons-material";
import {Routes} from "../../router";
import {useLocalization, useRouter} from "../../store";

const {Link} = require("mobx-router");

interface HomeMenuItemProps {
    onClick?: () => void
}

const useStyles = makeStyles(() => createStyles({
    undecoratedLink: {
        textDecoration: "none",
        color: "inherit"
    }
}));

export const HomeMenuItem: FunctionComponent<HomeMenuItemProps> = observer(({onClick}) => {
    const classes = useStyles();
    const {l} = useLocalization();
    const routerStore = useRouter();

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
                    <Home/>
                </ListItemIcon>
                <ListItemText>
                    {l("home")}
                </ListItemText>
            </MenuItem>
        </Link>
    )
});
