import React, {Fragment, FunctionComponent, ReactNode} from "react";
import {observer} from "mobx-react";
import { AppBar as MuiAppBar, Toolbar, Typography } from "@mui/material";
import {createStyles, makeStyles} from "@mui/styles";
import {Link} from "mobx-router";
import {NavigationalDrawer} from "./NavigationalDrawer";
import {OpenDrawerButton} from "./OpenDrawerButton";
import {AppBarMenu} from "./AppBarMenu";
import {UserAppBarMenu} from "./UserAppBarMenu";
import {useLocalization, useRouter, useStore} from "../../store";
import {Routes} from "../../router";
import {Labels} from "../../localization";

interface AppBarProps {
    title?: keyof Labels,
    additionalLeftItem?: ReactNode,
    hideTitle?: boolean
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

export const AppBar: FunctionComponent<AppBarProps> = observer(({
    title,
    additionalLeftItem,
    hideTitle = false
}) => {
    const classes = useClasses();
    const {
        messagesForwarding: {
            forwardModeActive
        }
    } = useStore();
    const {l} = useLocalization();
    const routerStore = useRouter();

    let appbarContent: ReactNode;

    if (forwardModeActive && routerStore.currentPath === Routes.myChats.path) {
        appbarContent = "Forward messages to...";
    } else {
        appbarContent = (
            <Fragment>
                {!hideTitle && (
                    <div className={classes.appBarTitle}>
                        <Link route={Routes.home}
                              router={routerStore}
                              className={classes.appBarLink}
                        >
                            <Typography variant="h6">
                                {title ? l(title) : "Chatox"}
                            </Typography>
                        </Link>
                        <AppBarMenu/>
                    </div>
                )}
                {additionalLeftItem && additionalLeftItem}
                <UserAppBarMenu/>
            </Fragment>
        )
    }

    return (
        <Fragment>
            <MuiAppBar position="fixed"
                       classes={{
                           root: classes.root
                       }}
            >
                <Toolbar>
                    <OpenDrawerButton/>
                    {appbarContent}
                </Toolbar>
            </MuiAppBar>
            <Toolbar/>
            <NavigationalDrawer/>
        </Fragment>
    );
});
