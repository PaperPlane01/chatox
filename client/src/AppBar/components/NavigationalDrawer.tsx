import React, {Fragment, FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Divider, List, SwipeableDrawer} from "@material-ui/core";
import {DrawerUserInfo} from "./DrawerUserInfo";
import {ProfileMenuItem} from "./ProfileMenuItem";
import {HomeMenuItem} from "./HomeMenuItem";
import {MyChatsMenuItem} from "./MyChatsMenuItem";
import {SettingsMenuItem} from "./SettingsMenuItem";
import {HasRole, LoginDialog, LoginMenuItem, LogOutMenuItem} from "../../Authorization";
import {RegistrationDialog, RegistrationMenuItem} from "../../Registration";
import {useStore} from "../../store";
import {DrawerAudioControls} from "./DrawerAudioControls";

export const NavigationalDrawer: FunctionComponent = observer(() => {
    const {appBar} = useStore();
    const {drawerExpanded, setDrawerExpanded} = appBar;

    const closeDrawer = (): void => setDrawerExpanded(false);
    const openDrawer = (): void => setDrawerExpanded(true);

    return (
        <Fragment>
            <SwipeableDrawer onClose={closeDrawer}
                             onOpen={openDrawer}
                             open={drawerExpanded}
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
                <DrawerAudioControls/>
            </SwipeableDrawer>
            <LoginDialog/>
            <RegistrationDialog/>
        </Fragment>
    )
});
