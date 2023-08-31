import React, {Fragment, FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Divider, List, SwipeableDrawer} from "@mui/material";
import {DrawerUserInfo} from "./DrawerUserInfo";
import {ProfileMenuItem} from "./ProfileMenuItem";
import {HomeMenuItem} from "./HomeMenuItem";
import {MyChatsMenuItem} from "./MyChatsMenuItem";
import {SettingsMenuItem} from "./SettingsMenuItem";
import {DrawerAudioControls} from "./DrawerAudioControls";
import {GlobalBansMenuItem} from "./GlobalBansMenuItem";
import {ReportsMenuItem} from "./ReportsMenuItem";
import {RewardsManagementMenuItem} from "./RewardsManagementMenuItem";
import {HasAnyRole, HasRole, LoginDialog, LoginMenuItem, LogOutMenuItem} from "../../Authorization";
import {RegistrationDialog, RegistrationMenuItem} from "../../Registration";
import {PasswordRecoveryDialog} from "../../PasswordRecovery";
import {useStore} from "../../store";
import {BalanceList} from "../../Balance/components";

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
                <HasAnyRole roles={["ROLE_USER", "ROLE_ANONYMOUS_USER"]}>
                    <DrawerUserInfo/>
                    <Divider/>
                </HasAnyRole>
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
                    <HasRole role="ROLE_ADMIN">
                        <Divider/>
                        <GlobalBansMenuItem onClick={closeDrawer}/>
                        <ReportsMenuItem onClick={closeDrawer}/>
                        <RewardsManagementMenuItem onClick={closeDrawer}/>
                    </HasRole>
                    <HasAnyRole roles={["ROLE_USER", "ROLE_ANONYMOUS_USER"]}>
                        <Divider/>
                        <LogOutMenuItem onClick={closeDrawer}/>
                    </HasAnyRole>
                </List>
                <HasRole role="ROLE_USER">
                    <BalanceList/>
                </HasRole>
                <DrawerAudioControls/>
            </SwipeableDrawer>
            <LoginDialog/>
            <RegistrationDialog/>
            <PasswordRecoveryDialog/>
        </Fragment>
    );
});
