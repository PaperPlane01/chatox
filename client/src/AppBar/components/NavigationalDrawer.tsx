import React, {Fragment, FunctionComponent} from "react";
import {inject, observer} from "mobx-react";
import {Divider, List, SwipeableDrawer} from "@material-ui/core";
import {DrawerUserInfo} from "./DrawerUserInfo";
import {ProfileMenuItem} from "./ProfileMenuItem";
import {HomeMenuItem} from "./HomeMenuItem";
import {MyChatsMenuItem} from "./MyChatsMenuItem";
import {SettingsMenuItem} from "./SettingsMenuItem";
import {HasRole, LoginDialog, LoginMenuItem, LogOutMenuItem} from "../../Authorization";
import {RegistrationDialog, RegistrationMenuItem} from "../../Registration";
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
                             PaperProps={{
                                 style: {
                                     width: 240
                                 }
                             }}
            >
                <HasRole role="ROLE_USER">
                    <DrawerUserInfo/>
                    <Divider/>
                </HasRole>
                <List>
                    <HomeMenuItem onClick={closeDrawer}/>
                    <Divider/>
                    <HasRole role="ROLE_USER">
                        <ProfileMenuItem onClick={closeDrawer}/>
                    </HasRole>
                    <HasRole role="ROLE_NOT_LOGGED_IN">
                        <LoginMenuItem onClick={closeDrawer}/>
                        <RegistrationMenuItem onClick={closeDrawer}/>
                    </HasRole>
                    <HasRole role="ROLE_USER">
                        <MyChatsMenuItem onClick={closeDrawer}/>
                    </HasRole>
                    <SettingsMenuItem onClick={closeDrawer}/>
                    <HasRole role="ROLE_USER">
                        <Divider/>
                        <LogOutMenuItem onClick={closeDrawer}/>
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

export const NavigationalDrawer = inject(mapMobxToProps)(observer(_NavigationalDrawer as FunctionComponent));
