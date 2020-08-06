import React, {ChangeEvent, FunctionComponent} from "react";
import {inject, observer} from "mobx-react";
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
import {Person, Settings} from "@material-ui/icons";
import {Language} from "@material-ui/icons";
import {SettingsTab} from "../types";
import {HasRole} from "../../Authorization";
import {EditProfileForm} from "../../User";
import {LanguagePicker, localized, Localized} from "../../localization";
import {MapMobxToProps} from "../../store";
import {Routes} from "../../router";

const {Link} = require("mobx-router");

interface SettingsTabsMobxProps {
    activeTab?: SettingsTab,
    routerStore?: any
}

type SettingsTabsProps = SettingsTabsMobxProps & Localized;

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

const tabsMapping = {
    [SettingsTab.PROFILE]: "0",
    [SettingsTab.LANGUAGE]: "1"
};

const _SettingsTabs: FunctionComponent<SettingsTabsProps> = ({
    activeTab,
    routerStore,
    l
}) => {
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
            </TabContext>
        </div>
    )
};

const mapMobxToProps: MapMobxToProps<SettingsTabsMobxProps> = ({settingsTabs, store}) => ({
    activeTab: settingsTabs.activeTab,
    routerStore: store
});

export const SettingsTabs = localized(
    inject(mapMobxToProps)(observer(_SettingsTabs))
) as FunctionComponent;
