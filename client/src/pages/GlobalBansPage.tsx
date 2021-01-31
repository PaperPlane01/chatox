import React, {FunctionComponent} from "react";
import {Grid, Typography} from "@material-ui/core";
import {GlobalBansContainer} from "../GlobalBan";
import {AppBar} from "../AppBar";
import {HasRole} from "../Authorization";
import {Layout} from "../Layout";

export const GlobalBansPage: FunctionComponent = () => (
    <Grid container>
        <Grid item xs={12}>
            <AppBar title="global.ban.banned-users"/>
        </Grid>
        <Grid item xs={12}>
            <Layout>
                <HasRole role="ROLE_ADMIN"
                         alternative={
                             <Typography>
                                 This page is only available to admins
                             </Typography>
                         }
                >
                    <GlobalBansContainer/>
                </HasRole>
            </Layout>
        </Grid>
    </Grid>
);

export default GlobalBansPage;