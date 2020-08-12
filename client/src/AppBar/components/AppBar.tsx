import React, {Fragment, FunctionComponent} from "react";
import {observer} from "mobx-react";
import {AppBar as MuiAppBar, createStyles, makeStyles, Toolbar, Typography} from "@material-ui/core";
import {NavigationalDrawer} from "./NavigationalDrawer";
import {OpenDrawerButton} from "./OpenDrawerButton";
import {AppBarMenu} from "./AppBarMenu";
import {UserAppBarMenu} from "./UserAppBarMenu";
import {useLocalization, useRouter} from "../../store";
import {Routes} from "../../router";
import {Labels} from "../../localization";

const {Link} = require("mobx-router");

interface AppBarProps {
    title?: keyof Labels
}

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
    appBarLink: {
        color: "inherit",
        textDecoration: "none"
    }
}));

export const AppBar: FunctionComponent<AppBarProps> = observer(({title}) => {
    const classes = useClasses();
    const {l} = useLocalization();
    const routerStore = useRouter();

    return (
        <Fragment>
            <MuiAppBar position="fixed"
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
            <Toolbar/>
            <NavigationalDrawer/>
        </Fragment>
    )
});
