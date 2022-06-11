import React, {FunctionComponent} from "react";
import {Grid, Typography} from "@mui/material";
import {Layout} from "../Layout";
import {AppBar} from "../AppBar";
import {useLocalization} from "../store";

export const NotFoundPage: FunctionComponent = () => {
    const {l} = useLocalization();

    return (
        <Grid container>
            <Grid item xs={12}>
                <AppBar/>
            </Grid>
            <Grid item xs={12}>
                <Layout>
                    <Typography variant="h6">
                        {l("page.not-found")}
                    </Typography>
                </Layout>
            </Grid>
        </Grid>
    )
};

export default NotFoundPage;
