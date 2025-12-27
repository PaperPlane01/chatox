import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Grid, Typography} from "@mui/material";
import {AppBar} from "../AppBar";
import {CreateStickerPackForm} from "../StickerPackForm/components";
import {HasRole} from "../Authorization";
import {Layout} from "../Layout";
import {useLocalization} from "../store";

export const CreateStickerPackPage: FunctionComponent = observer(() => {
    const  {l} = useLocalization();

    return (
        <Grid container>
            <Grid item xs={12}>
                <AppBar title="sticker.pack.create"/>
            </Grid>
            <Grid item xs={12}>
                <Layout>
                    <HasRole role="ROLE_USER"
                             alternative={(
                                 <Typography>
                                     {l("sticker.pack.create.login-required")}
                                 </Typography>
                             )}
                    >
                        <CreateStickerPackForm/>
                    </HasRole>
                </Layout>
            </Grid>
        </Grid>
    );
})

export default CreateStickerPackPage;
