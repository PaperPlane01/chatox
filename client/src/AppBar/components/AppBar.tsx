import React, {FunctionComponent, Fragment} from "react";
import {inject, observer} from "mobx-react";
import Headroom from "react-headroom";
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
    },
    headroom: {
        position: "fixed",
        zIndex: 1300
    }
}));

const _AppBar: FunctionComponent<AppBarMobxProps> = ({
    setDrawerOpen
}) => {
    const classes = useClasses();

    return (
        <Fragment>
            <Headroom style={{
                position: "fixed",
                zIndex: 1300
            }}>
                <MuiAppBar position="sticky"
                           classes={{
                               root: classes.root
                           }}
                >
                    <Toolbar>
                        <IconButton className={classes.drawerButton}
                                    onClick={() => setDrawerOpen(true)}
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
            </Headroom>
            <NavigationalDrawer/>
        </Fragment>
    )
};

const mapMobxToProps = (state: IAppState): AppBarMobxProps => ({
    setDrawerOpen: state.appBar.setDrawerExpanded
});

export const AppBar = inject(mapMobxToProps)(observer(_AppBar as FunctionComponent<{}>));


