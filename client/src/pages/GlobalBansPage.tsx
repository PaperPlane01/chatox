import React, {FunctionComponent} from "react";
import {Grid, Typography} from "@mui/material";
import {GlobalBansContainer, GlobalBanDetailsDialog, UpdateGlobalBanDialog} from "../GlobalBan/components";
import {AppBar} from "../AppBar/components";
import {HasRole} from "../Authorization/components";
import {Layout} from "../Layout/components";

export const GlobalBansPage: FunctionComponent = () => (
    <Grid container>
        <Grid size={12}>
            <AppBar title="global.ban.banned-users"/>
        </Grid>
        <Grid size={12}>
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
        <GlobalBanDetailsDialog/>
        <UpdateGlobalBanDialog/>
    </Grid>
);

export default GlobalBansPage;
