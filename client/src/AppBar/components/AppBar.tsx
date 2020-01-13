import React, {FunctionComponent, Fragment} from "react";
import {inject, observer} from "mobx-react";
import {AppBar as MuiAppBar, Toolbar, Typography, IconButton, createStyles, makeStyles} from "@material-ui/core";
import MenuIcon from "@material-ui/icons/Menu";
import {NavigationalDrawer} from "./NavigationalDrawer";
import {IAppState} from "../../store";

interface AppBarMobxProps {
    setDrawerOpen: (drawerOpen: boolean) => void
}

const useClasses = makeStyles(() => createStyles({
    root: {
        flexGrow: 1
    },
    grow: {
        flexGrow: 1
    },
    drawerButton: {
        marginLeft: -12,
        marginRight: 20,
        color: "inherit"
    },
    appBarTitle: {
        flexGrow: 1,
        display: "flex"
    }
}));

const _AppBar: FunctionComponent<AppBarMobxProps> = ({
    setDrawerOpen
}) => {
    const classes = useClasses();

    return (
        <Fragment>
            <MuiAppBar position="sticky"
                       classes={{
                           root: classes.root,
                           grow: classes.grow
                       }}
            >
                <Toolbar>

                    <IconButton className={classes.drawerButton}
                                onClick={() => setDrawerOpen(false)}
                    >
                        <MenuIcon/>
                    </IconButton>
                    <div className={classes.appBarTitle}>
                        <Typography variant="h6">
                            Chatox
                        </Typography>
                    </div>
                </Toolbar>
            </MuiAppBar>
            <NavigationalDrawer/>
        </Fragment>
    )
};

const mapMobxToProps = (state: IAppState): AppBarMobxProps => ({
    setDrawerOpen: state.appBar.setDrawerExpanded
});

export const AppBar = inject(mapMobxToProps)(observer(_AppBar as FunctionComponent<{}>));


