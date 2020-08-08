import React, {FunctionComponent, Fragment} from "react";
import {Hidden} from "@material-ui/core";
import {SettingsTabs} from "./SettingsTabs";
import {SettingsMenu} from "./SettingsMenu";

export const SettingsContainer: FunctionComponent = () => (
    <Fragment>
        <Hidden mdDown>
            <SettingsTabs/>
        </Hidden>
        <Hidden lgUp>
            <SettingsMenu/>
        </Hidden>
    </Fragment>
);
