import React, {FunctionComponent} from "react";
import {Grid} from "@material-ui/core";
import {Layout} from "../Layout";
import {AppBar} from "../AppBar";
import {
    StickerPacksSearchResults,
    StickerPackDialog,
    StickerPackUninstallationSnackbarManager,
    StickerPackInstallationSnackbarManager
} from "../Sticker";

export const StickerPacksPage: FunctionComponent = () => (
    <Grid container>
        <Grid item xs={12}>
            <AppBar title="sticker.pack.list"/>
        </Grid>
        <Grid item xs={12}>
            <Layout>
                <StickerPacksSearchResults/>
            </Layout>
        </Grid>
        <StickerPackDialog/>
        <StickerPackUninstallationSnackbarManager/>
        <StickerPackInstallationSnackbarManager/>
    </Grid>
);

export default StickerPacksPage;
