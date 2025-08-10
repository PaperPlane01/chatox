import React, {FunctionComponent} from "react";
import {Grid} from "@mui/material";
import {Layout} from "../Layout/components";
import {AppBar} from "../AppBar/components";
import {DeleteStickerPackDialog, StickerPackDialog, StickerPacksSearchResults} from "../Sticker/components";

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
        <DeleteStickerPackDialog/>
    </Grid>
);

export default StickerPacksPage;
