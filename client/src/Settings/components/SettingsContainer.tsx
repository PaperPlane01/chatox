import React, {FunctionComponent, Fragment} from "react";
import {Hidden} from "@mui/material";
import {SettingsTabs} from "./SettingsTabs";
import {SettingsMenu} from "./SettingsMenu";

export const SettingsContainer: FunctionComponent = () => (
    <Fragment>
        <Hidden xlDown>
            <SettingsTabs/>
        </Hidden>
        <Hidden lgUp>
            <SettingsMenu/>
        </Hidden>
    </Fragment>
);
