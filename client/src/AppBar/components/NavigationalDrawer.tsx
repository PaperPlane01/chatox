import React, {FunctionComponent, Fragment} from "react";
import {inject, observer} from "mobx-react";
import {SwipeableDrawer, List} from "@material-ui/core";
import {HasRole} from "../../Authorization";
import {LoginMenuItem, LogOutMenuItem, LoginDialog} from "../../Authorization";
import {RegistrationMenuItem, RegistrationDialog} from "../../Registration";
import {IAppState} from "../../store";

interface NavigationalDrawerMobxProps {
    setDrawerOpen: (drawerOpen: boolean) => void,
    drawerOpen: boolean
}

const _NavigationalDrawer: FunctionComponent<NavigationalDrawerMobxProps> = ({
    drawerOpen,
    setDrawerOpen
}) => {
    const closeDrawer = (): void => setDrawerOpen(false);
    const openDrawer = (): void => setDrawerOpen(true);

    return (
        <Fragment>
            <SwipeableDrawer onClose={closeDrawer}
                             onOpen={openDrawer}
                             open={drawerOpen}
            >
                <List>
                    <HasRole role="ROLE_NOT_LOGGED_IN">
                        <LoginMenuItem onClick={closeDrawer}/>
                        <RegistrationMenuItem onClick={closeDrawer}/>
                    </HasRole>
                    <HasRole role="ROLE_USER">
                        <LogOutMenuItem/>
                    </HasRole>
                </List>
            </SwipeableDrawer>
            <LoginDialog/>
            <RegistrationDialog/>
        </Fragment>
    )
};

const mapMobxToProps = (state: IAppState): NavigationalDrawerMobxProps => ({
    setDrawerOpen: state.appBar.setDrawerExpanded,
    drawerOpen: state.appBar.drawerExpanded
});

export const NavigationalDrawer = inject(mapMobxToProps)(observer(_NavigationalDrawer as FunctionComponent<{}>));
