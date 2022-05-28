import React, {FunctionComponent} from "react";
import {Grid} from "@mui/material";
import {Layout} from "../Layout";
import {AppBar} from "../AppBar";
import {SettingsContainer} from "../Settings";
import {
    StickerPackDialog,
    StickerPackInstallationSnackbarManager,
    StickerPackUninstallationSnackbarManager
} from "../Sticker";

export const SettingsPage: FunctionComponent = () => (
    <Grid container>
        <Grid item xs={12}>
            <AppBar title="settings"/>
        </Grid>
        <Grid item xs={12}>
            <Layout>
                <SettingsContainer/>
            </Layout>
        </Grid>
        <StickerPackDialog/>
        <StickerPackInstallationSnackbarManager/>
        <StickerPackUninstallationSnackbarManager/>
    </Grid>
);

export default SettingsPage;
