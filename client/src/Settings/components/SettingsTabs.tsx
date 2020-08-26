import React, {ChangeEvent, FunctionComponent} from "react";
import {observer} from "mobx-react";
import {
    createStyles,
    ListItemIcon,
    ListItemText,
    makeStyles,
    MenuItem,
    Tab,
    Theme,
    Typography
} from "@material-ui/core";
import {TabContext, TabList, TabPanel} from "@material-ui/lab";
import {Language, Person, Security} from "@material-ui/icons";
import {SettingsTab} from "../types";
import {HasRole} from "../../Authorization";
import {EditProfileForm, ChangePasswordContainer} from "../../User";
import {LanguagePicker} from "../../localization";
import {useLocalization, useRouter, useStore} from "../../store";
import {Routes} from "../../router";

const useStyles = makeStyles((theme: Theme) => createStyles({
    undecoratedLink: {
        textDecoration: "none",
        color: "inherit"
    },
    tabsContainer: {
        display: "flex"
    },
    tabs: {
        borderRight: `1px solid ${theme.palette.divider}`,
    },
    fullWidth: {
        width: "80%"
    },
    flexContainer: {
        display: "flex",
        alignItems: "flex-start"
    }
}));

export const SettingsTabs: FunctionComponent = observer(() => {
    const {
        settingsTabs: {
            activeTab
        }
    } = useStore();
    const routerStore = useRouter();
    const {l} = useLocalization();
    const classes = useStyles();

    const goTo = (settingsTab: string) => {
        routerStore.router.goTo(Routes.settingsTabPage, {tab: settingsTab});
    };

    return (
        <div className={classes.tabsContainer}>
            <TabContext value={activeTab ? activeTab : SettingsTab.PROFILE}>
                <TabList orientation="vertical"
                         variant="fullWidth"
                         className={classes.tabs}
                         onChange={(event: ChangeEvent<{}>, newValue: string) => goTo(newValue)}
                         classes={{
                             flexContainer: classes.flexContainer
                         }}
                >
                    <Tab value={SettingsTab.PROFILE}
                         label={
                             <MenuItem>
                                 <ListItemIcon>
                                     <Person/>
                                 </ListItemIcon>
                                 <ListItemText>
                                     {l("settings.profile")}
                                 </ListItemText>
                             </MenuItem>
                         }
                    />
                    <Tab value={SettingsTab.LANGUAGE}
                         label={
                             <MenuItem>
                                 <ListItemIcon>
                                     <Language/>
                                 </ListItemIcon>
                                 <ListItemText>
                                     {l("settings.language")}
                                 </ListItemText>
                             </MenuItem>
                         }
                    />
                    <Tab value={SettingsTab.SECURITY}
                         label={
                             <MenuItem>
                                 <ListItemIcon>
                                     <Security/>
                                 </ListItemIcon>
                                 <ListItemText>
                                     {l("settings.security")}
                                 </ListItemText>
                             </MenuItem>
                         }
                    />
                </TabList>
                <TabPanel value={SettingsTab.PROFILE}
                          className={classes.fullWidth}
                >
                    <HasRole role="ROLE_USER"
                             alternative={
                                 <Typography>
                                     {l("user.edit-profile.authorization-required")}
                                 </Typography>
                             }
                    >
                        <EditProfileForm/>
                    </HasRole>
                </TabPanel>
                <TabPanel value={SettingsTab.LANGUAGE}
                          className={classes.fullWidth}
                >
                    <LanguagePicker/>
                </TabPanel>
                <TabPanel value={SettingsTab.SECURITY}
                          className={classes.fullWidth}
                >
                    <HasRole role="ROLE_USER"
                             alternative={
                                 <Typography>
                                     {l("settings.security.authorization-required")}
                                 </Typography>
                             }
                    >
                        <ChangePasswordContainer/>
                    </HasRole>
                </TabPanel>
            </TabContext>
        </div>
    )
});
