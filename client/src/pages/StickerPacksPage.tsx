import React, {Fragment, FunctionComponent} from "react";
import {Grid} from "@mui/material";
import {Layout} from "../Layout/components";
import {AppBar} from "../AppBar/components";
import {
    DeleteStickerPackDialog,
    StickerPackDialog,
    StickerPacksSearchResults,
    StickerPreviewDialog
} from "../Sticker/components";

export const StickerPacksPage: FunctionComponent = () => (
    <Fragment>
        <Grid container>
            <Grid size={12}>
                <AppBar title="sticker.pack.list"/>
            </Grid>
            <Grid size={12}>
                <Layout>
                    <StickerPacksSearchResults/>
                </Layout>
            </Grid>
        </Grid>
        <StickerPackDialog/>
        <DeleteStickerPackDialog/>
        <StickerPreviewDialog/>
    </Fragment>
);

export default StickerPacksPage;
