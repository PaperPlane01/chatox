import React, {FunctionComponent} from "react";
import {useMediaQuery, useTheme} from "@mui/material";
import {SettingsTabs} from "./SettingsTabs";
import {SettingsMenu} from "./SettingsMenu";

export const SettingsContainer: FunctionComponent = () => {
    const theme = useTheme();
    const onSmallScreen = useMediaQuery(theme.breakpoints.down("lg"));
    return onSmallScreen ? <SettingsMenu/> : <SettingsTabs/>
};
