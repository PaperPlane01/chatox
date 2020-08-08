import React, {Fragment, FunctionComponent} from "react";
import {inject, observer} from "mobx-react";
import Headroom from "react-headroom";
import {AppBar as MuiAppBar, createStyles, makeStyles, Toolbar, Typography} from "@material-ui/core";
import {NavigationalDrawer} from "./NavigationalDrawer";
import {OpenDrawerButton} from "./OpenDrawerButton";
import {AppBarMenu} from "./AppBarMenu";
import {UserAppBarMenu} from "./UserAppBarMenu";
import {IAppState} from "../../store";
import {Routes} from "../../router";
import {Labels, Localized, localized} from "../../localization";

const {Link} = require("mobx-router");

interface AppBarOwnProps {
    title?: keyof Labels
}

interface AppBarMobxProps {
    routerStore?: any
}

type AppBarProps = AppBarMobxProps & AppBarOwnProps & Localized;

const useClasses = makeStyles(() => createStyles({
    root: {
        flexGrow: 1
    },
    grow: {
        flexGrow: 1
    },
    appBarTitle: {
        flexGrow: 1,
        display: "flex"
    },
    headroom: {
        position: "fixed",
        zIndex: 1300
    },
    appBarLink: {
        color: "inherit",
        textDecoration: "none"
    }
}));

const _AppBar: FunctionComponent<AppBarProps> = ({
    routerStore,
    l,
    title
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
                        <OpenDrawerButton/>
                        <div className={classes.appBarTitle}>
                            <Link view={Routes.home}
                                  store={routerStore}
                                  className={classes.appBarLink}
                            >
                                <Typography variant="h6">
                                    {title ? l(title) : "Chatox"}
                                </Typography>
                            </Link>
                            <AppBarMenu/>
                        </div>
                        <UserAppBarMenu/>
                    </Toolbar>
                </MuiAppBar>
            </Headroom>
            <NavigationalDrawer/>
        </Fragment>
    )
};

const mapMobxToProps = (state: IAppState): AppBarMobxProps => ({
    routerStore: state.store
});

export const AppBar = localized(
    inject(mapMobxToProps)(observer(_AppBar))
) as FunctionComponent<AppBarOwnProps>;


