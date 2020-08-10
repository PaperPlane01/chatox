import React, {Fragment, FunctionComponent} from "react";
import {createStyles, List, ListItemIcon, ListItemText, makeStyles, MenuItem} from "@material-ui/core";
import {Language, Person} from "@material-ui/icons";
import {SettingsFullScreenDialog} from "./SettingsFullScreenDialog";
import {EditProfileForm} from "../../User";
import {LanguagePicker, localized, Localized} from "../../localization";
import {SettingsTab} from "../types";
import {Routes} from "../../router";
import {MapMobxToProps} from "../../store";
import {inject, observer} from "mobx-react";

const {Link} = require("mobx-router");

interface SettingsMenuMobxProps {
    activeTab?: SettingsTab,
    routerStore?: any
}

type SettingsMenuProps = SettingsMenuMobxProps & Localized;

const useStyles = makeStyles(() => createStyles({
    undecoratedLink: {
        textDecoration: "none",
        color: "inherit"
    }
}));

const _SettingsMenu: FunctionComponent<SettingsMenuProps> = ({
    activeTab,
    routerStore,
    l
}) => {
    const classes = useStyles();

    return (
        <Fragment>
            <List>
                <Link className={classes.undecoratedLink}
                      view={Routes.settingsTabPage}
                      params={{tab: SettingsTab.PROFILE}}
                      store={routerStore}
                >
                    <MenuItem>
                        <ListItemIcon>
                            <Person/>
                        </ListItemIcon>
                        <ListItemText>
                            {l("settings.profile")}
                        </ListItemText>
                    </MenuItem>
                </Link>
                <Link className={classes.undecoratedLink}
                      view={Routes.settingsTabPage}
                      params={{tab: SettingsTab.LANGUAGE}}
                      store={routerStore}
                >
                    <MenuItem>
                        <ListItemIcon>
                            <Language/>
                        </ListItemIcon>
                        <ListItemText>
                            {l("settings.language")}
                        </ListItemText>
                    </MenuItem>
                </Link>
            </List>
            <SettingsFullScreenDialog title={l("user.edit-profile")}
                                      open={activeTab === SettingsTab.PROFILE}
            >
                <EditProfileForm/>
            </SettingsFullScreenDialog>
            <SettingsFullScreenDialog title={l("language.select-language")}
                                      open={activeTab === SettingsTab.LANGUAGE}
            >
                <LanguagePicker/>
            </SettingsFullScreenDialog>
        </Fragment>
    )
};

const mapMobxToProps: MapMobxToProps<SettingsMenuMobxProps> = ({settingsTabs, store}) => ({
    activeTab: settingsTabs.activeTab,
    routerStore: store
});

export const SettingsMenu = localized(
    inject(mapMobxToProps)(observer(_SettingsMenu))
) as FunctionComponent;
