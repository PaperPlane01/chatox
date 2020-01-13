import React, {FunctionComponent} from "react";
import {Grid, Typography} from "@material-ui/core";
import {Layout} from "../Layout";
import {AppBar} from "../AppBar";
import {localized, Localized} from "../localization";

const _NotFoundPage: FunctionComponent<Localized> = ({l}) => (
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
);

export const NotFoundPage = localized(_NotFoundPage) as FunctionComponent<{}>;
