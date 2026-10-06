import React, {FunctionComponent} from "react";
import {Grid, Typography} from "@mui/material";
import {Layout} from "../Layout/components";
import {AppBar} from "../AppBar/components";
import {useLocalization} from "../store/hooks";

export const NotFoundPage: FunctionComponent = () => {
    const {l} = useLocalization();

    return (
        <Grid container>
            <Grid size={12}>
                <AppBar/>
            </Grid>
            <Grid size={12}>
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
