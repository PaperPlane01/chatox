import React, {FunctionComponent} from "react";
import {Grid, Typography} from "@material-ui/core";
import {AppBar} from "../AppBar";
import {CreateStickerPackForm} from "../Sticker";
import {HasRole} from "../Authorization";
import {Layout} from "../Layout";

export const CreateStickerPackPage: FunctionComponent = () => (
    <Grid container>
        <Grid item xs={12}>
            <AppBar title="sticker.pack.create"/>
        </Grid>
        <Grid item xs={12}>
            <Layout>
                <HasRole role="ROLE_USER"
                         alternative={(
                             <Typography>
                                 You have to be logged in to create sticker pack
                             </Typography>
                         )}
                >
                    <CreateStickerPackForm/>
                </HasRole>
            </Layout>
        </Grid>
    </Grid>
);

export default CreateStickerPackPage;
