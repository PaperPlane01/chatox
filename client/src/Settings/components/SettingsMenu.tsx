import React, {Fragment, FunctionComponent} from "react";
import {observer} from "mobx-react";
import {createStyles, List, ListItemIcon, ListItemText, makeStyles, MenuItem} from "@material-ui/core";
import {Language, Person} from "@material-ui/icons";
import {SettingsFullScreenDialog} from "./SettingsFullScreenDialog";
import {EditProfileForm} from "../../User";
import {LanguagePicker} from "../../localization";
import {SettingsTab} from "../types";
import {Routes} from "../../router";
import {useLocalization, useRouter, useStore} from "../../store";

const {Link} = require("mobx-router");

const useStyles = makeStyles(() => createStyles({
    undecoratedLink: {
        textDecoration: "none",
        color: "inherit"
    }
}));

export const SettingsMenu: FunctionComponent = observer(() => {
    const {
        settingsTabs: {
            activeTab
        }
    } = useStore();
    const {l} = useLocalization();
    const routerStore = useRouter();
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
                <EditProfileForm hideHeader/>
            </SettingsFullScreenDialog>
            <SettingsFullScreenDialog title={l("language.select-language")}
                                      open={activeTab === SettingsTab.LANGUAGE}
            >
                <LanguagePicker hideHeader/>
            </SettingsFullScreenDialog>
        </Fragment>
    )
});
