import React, {Fragment, FunctionComponent} from "react";
import {observer} from "mobx-react";
import {createStyles, List, ListItemIcon, ListItemText, makeStyles, MenuItem} from "@material-ui/core";
import {Language, Palette, Person, Security} from "@material-ui/icons";
import {SettingsFullScreenDialog} from "./SettingsFullScreenDialog";
import {ChangePasswordContainer, EditProfileForm} from "../../User";
import {EmojiSetPicker} from "../../Emoji";
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
                <Link className={classes.undecoratedLink}
                      view={Routes.settingsTabPage}
                      params={{tab: SettingsTab.APPEARANCE}}
                      store={routerStore}
                >
                    <MenuItem>
                        <ListItemIcon>
                            <Palette/>
                        </ListItemIcon>
                        <ListItemText>
                            {l("settings.appearance")}
                        </ListItemText>
                    </MenuItem>
                </Link>
                <Link className={classes.undecoratedLink}
                      view={Routes.settingsTabPage}
                      params={{tab: SettingsTab.SECURITY}}
                      store={routerStore}
                >
                    <MenuItem>
                        <ListItemIcon>
                            <Security/>
                        </ListItemIcon>
                        <ListItemText>
                            {l("settings.security")}
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
            <SettingsFullScreenDialog title={l("settings.security")}
                                      open={activeTab === SettingsTab.SECURITY}
            >
                <ChangePasswordContainer/>
            </SettingsFullScreenDialog>
            <SettingsFullScreenDialog title={l("settings.appearance")}
                                      open={activeTab === SettingsTab.APPEARANCE}
            >
                <EmojiSetPicker/>
            </SettingsFullScreenDialog>
        </Fragment>
    )
});
