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
import {Language, Palette, Person, Security, ChatBubble, Image, Block} from "@material-ui/icons";
import {SettingsTab} from "../types";
import {HasAnyRole, HasRole} from "../../Authorization";
import {EditProfileForm, ChangePasswordContainer} from "../../User";
import {EmojiSetPicker} from "../../Emoji";
import {ChatsPreferencesCard} from "../../Chat";
import {LanguagePicker} from "../../localization";
import {useLocalization, useRouter, useStore} from "../../store";
import {Routes} from "../../router";
import {InstalledStickerPacksList} from "../../Sticker";
import {BlacklistedUsersList} from "../../Blacklist";

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
                    <Tab value={SettingsTab.APPEARANCE}
                         label={
                             <MenuItem>
                                 <ListItemIcon>
                                     <Palette/>
                                 </ListItemIcon>
                                 <ListItemText>
                                     {l("settings.appearance")}
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
                    <Tab value={SettingsTab.CHATS}
                         label={
                             <MenuItem>
                                 <ListItemIcon>
                                     <ChatBubble/>
                                 </ListItemIcon>
                                 <ListItemText>
                                     {l("settings.chats")}
                                 </ListItemText>
                             </MenuItem>
                         }
                    />
                    <Tab value={SettingsTab.STICKERS}
                         label={
                             <MenuItem>
                                 <ListItemIcon>
                                     <Image/>
                                 </ListItemIcon>
                                 <ListItemText>
                                     {l("sticker.pack.list")}
                                 </ListItemText>
                             </MenuItem>
                         }
                    />
                    <Tab value={SettingsTab.BLACKLIST}
                         label={
                             <MenuItem>
                                 <ListItemIcon>
                                     <Block/>
                                 </ListItemIcon>
                                 <ListItemText>
                                     {l("blacklist.users")}
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
                <TabPanel value={SettingsTab.APPEARANCE}
                          className={classes.fullWidth}
                >
                    <EmojiSetPicker/>
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
                <TabPanel value={SettingsTab.CHATS}
                          className={classes.fullWidth}
                >
                    <ChatsPreferencesCard/>
                </TabPanel>
                <TabPanel value={SettingsTab.STICKERS}
                          className={classes.fullWidth}
                >
                    <HasAnyRole roles={["ROLE_USER", "ROLE_ANONYMOUS_USER"]}
                                alternative={
                                    <Typography>
                                        {l("common.authorization-required")}
                                    </Typography>
                                }
                    >
                        <InstalledStickerPacksList/>
                    </HasAnyRole>
                </TabPanel>
                <TabPanel value={SettingsTab.BLACKLIST}
                          className={classes.fullWidth}
                >
                    <HasAnyRole roles={["ROLE_USER", "ROLE_ANONYMOUS_USER"]}
                                alternative={
                                    <Typography>
                                        {l("common.authorization-required")}
                                    </Typography>
                                }
                    >
                        <BlacklistedUsersList/>
                    </HasAnyRole>
                </TabPanel>
            </TabContext>
        </div>
    )
});
