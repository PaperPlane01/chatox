import React, {FunctionComponent} from "react";
import {Grid} from "@mui/material";
import {Layout} from "../Layout/components";
import {AppBar} from "../AppBar/components";
import {SettingsContainer} from "../Settings/components";
import {DeleteStickerPackDialog, StickerPackDialog} from "../Sticker/components";

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
        <DeleteStickerPackDialog/>
    </Grid>
);

export default SettingsPage;
