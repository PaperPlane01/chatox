import React, {FunctionComponent} from "react";
import {Grid} from "@material-ui/core";
import {Layout} from "../Layout";
import {AppBar} from "../AppBar";
import {SettingsContainer} from "../Settings";

export const SettingsPage: FunctionComponent = () => (
    <Grid container>
        <Grid item xs={12}>
            <AppBar title="settings"/>
        </Grid>
        <Grid item xs={12}>
            <Layout>
                <SettingsContainer/>
            </Layout>
        </Grid>
    </Grid>
);

export default SettingsPage;
