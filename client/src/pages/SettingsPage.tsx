import React, {Fragment, FunctionComponent} from "react";
import {Grid} from "@mui/material";
import {Layout} from "../Layout/components";
import {AppBar} from "../AppBar/components";
import {SettingsContainer} from "../Settings/components";
import {DeleteStickerPackDialog, StickerPackDialog, StickerPreviewDialog} from "../Sticker/components";

export const SettingsPage: FunctionComponent = () => (
    <Fragment>
        <Grid container>
            <Grid size={12}>
                <AppBar title="settings"/>
            </Grid>
            <Grid size={12}>
                <Layout>
                    <SettingsContainer/>
                </Layout>
            </Grid>
        </Grid>
        <StickerPackDialog/>
        <DeleteStickerPackDialog/>
        <StickerPreviewDialog/>
    </Fragment>
);

export default SettingsPage;
