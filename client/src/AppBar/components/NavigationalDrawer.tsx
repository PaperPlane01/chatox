import React, {Fragment, FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Divider, List, SwipeableDrawer} from "@material-ui/core";
import {DrawerUserInfo} from "./DrawerUserInfo";
import {ProfileMenuItem} from "./ProfileMenuItem";
import {HomeMenuItem} from "./HomeMenuItem";
import {MyChatsMenuItem} from "./MyChatsMenuItem";
import {SettingsMenuItem} from "./SettingsMenuItem";
import {DrawerAudioControls} from "./DrawerAudioControls";
import {HasAnyRole, HasRole, LoginDialog, LoginMenuItem, LogOutMenuItem} from "../../Authorization";
import {RegistrationDialog, RegistrationMenuItem} from "../../Registration";
import {PasswordRecoveryDialog} from "../../PasswordRecovery";
import {useStore} from "../../store";

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
                    <HasAnyRole roles={["ROLE_USER", "ROLE_ANONYMOUS_USER"]}>
                        <ProfileMenuItem onClick={closeDrawer}/>
                    </HasAnyRole>
                    <HasRole role="ROLE_NOT_LOGGED_IN">
                        <LoginMenuItem onClick={closeDrawer}/>
                        <RegistrationMenuItem onClick={closeDrawer}/>
                    </HasRole>
                    <HasAnyRole roles={["ROLE_USER", "ROLE_ANONYMOUS_USER"]}>
                        <MyChatsMenuItem onClick={closeDrawer}/>
                    </HasAnyRole>
                    <SettingsMenuItem onClick={closeDrawer}/>
                    <HasAnyRole roles={["ROLE_USER", "ROLE_ANONYMOUS_USER"]}>
                        <Divider/>
                        <LogOutMenuItem onClick={closeDrawer}/>
                    </HasAnyRole>
                </List>
                <DrawerAudioControls/>
            </SwipeableDrawer>
            <LoginDialog/>
            <RegistrationDialog/>
            <PasswordRecoveryDialog/>
        </Fragment>
    )
});
