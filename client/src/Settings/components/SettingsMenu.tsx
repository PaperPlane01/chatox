import React, {Fragment, FunctionComponent} from "react";
import {observer} from "mobx-react";
import {List, ListItemIcon, ListItemText, MenuItem, Typography} from "@mui/material";
import {createStyles, makeStyles} from "@mui/styles";
import {ChatBubble, Image, Language, Notifications, Palette, Person, Security} from "@mui/icons-material";
import {Link} from "mobx-router";
import {SettingsFullScreenDialog} from "./SettingsFullScreenDialog";
import {SecurityTabWrapper} from "./SecurityTabWrapper";
import {AppearanceTabWrapper} from "./AppearanceTabWrapper";
import {SettingsTab} from "../types";
import {EditProfileForm} from "../../User";
import {LanguagePicker} from "../../localization";
import {Routes} from "../../router";
import {useLocalization, useRouter, useStore} from "../../store";
import {ChatsPreferencesCard} from "../../Chat";
import {HasAnyRole} from "../../Authorization";
import {InstalledStickerPacksList} from "../../Sticker";
import {GlobalNotificationsSettingsUpdate} from "../../Notification";

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
                      route={Routes.settingsTabPage}
                      params={{tab: SettingsTab.PROFILE}}
                      router={routerStore}
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
                      route={Routes.settingsTabPage}
                      params={{tab: SettingsTab.LANGUAGE}}
                      router={routerStore}
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
                      route={Routes.settingsTabPage}
                      params={{tab: SettingsTab.APPEARANCE}}
                      router={routerStore}
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
                      route={Routes.settingsTabPage}
                      params={{tab: SettingsTab.SECURITY}}
                      router={routerStore}
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
                <Link className={classes.undecoratedLink}
                      route={Routes.settingsTabPage}
                      params={{tab: SettingsTab.CHATS}}
                      router={routerStore}
                >
                    <MenuItem>
                        <ListItemIcon>
                            <ChatBubble/>
                        </ListItemIcon>
                        <ListItemText>
                            {l("settings.chats")}
                        </ListItemText>
                    </MenuItem>
                </Link>
                <Link className={classes.undecoratedLink}
                      route={Routes.settingsTabPage}
                      params={{tab: SettingsTab.NOTIFICATIONS}}
                      router={routerStore}
                >
                    <MenuItem>
                        <ListItemIcon>
                            <Notifications/>
                        </ListItemIcon>
                        <ListItemText>
                            {l("settings.notifications")}
                        </ListItemText>
                    </MenuItem>
                </Link>
                <Link className={classes.undecoratedLink}
                      route={Routes.settingsTabPage}
                      params={{tab: SettingsTab.STICKERS}}
                      router={routerStore}
                >
                    <MenuItem>
                        <ListItemIcon>
                            <Image/>
                        </ListItemIcon>
                        <ListItemText>
                            {l("sticker.pack.list")}
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
                <SecurityTabWrapper/>
            </SettingsFullScreenDialog>
            <SettingsFullScreenDialog title={l("settings.appearance")}
                                      open={activeTab === SettingsTab.APPEARANCE}
            >
                <AppearanceTabWrapper/>
            </SettingsFullScreenDialog>
            <SettingsFullScreenDialog title={l("settings.chats")}
                                      open={activeTab === SettingsTab.CHATS}
            >
                <ChatsPreferencesCard/>
            </SettingsFullScreenDialog>
            <SettingsFullScreenDialog title={l("settings.notifications")}
                                      open={activeTab === SettingsTab.NOTIFICATIONS}
            >
                <GlobalNotificationsSettingsUpdate/>
            </SettingsFullScreenDialog>
            <SettingsFullScreenDialog title={l("sticker.pack.list")}
                                      open={activeTab === SettingsTab.STICKERS}>
                <HasAnyRole roles={["ROLE_USER", "ROLE_ANONYMOUS_USER"]}
                            alternative={
                                <Typography>
                                    {l("common.authorization-required")}
                                </Typography>
                            }
                >
                    <InstalledStickerPacksList/>
                </HasAnyRole>
            </SettingsFullScreenDialog>
        </Fragment>
    );
});
