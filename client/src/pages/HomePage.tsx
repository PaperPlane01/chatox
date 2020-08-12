import React, {FunctionComponent} from "react";
import {Card, CardContent, CardHeader, Grid, Typography} from "@material-ui/core";
import {Layout} from "../Layout";
import {AppBar} from "../AppBar";
import {HasRole} from "../Authorization";
import {CreateChatDialog, CreateChatFloatingActionButton} from "../Chat";

export const HomePage: FunctionComponent = () => (
    <Grid container>
        <Grid item xs={12}>
            <AppBar/>
        </Grid>
        <Grid item xs={12}>
            <Layout>
                <Card>
                    <CardHeader title="Welcome to Chatox"/>
                    <CardContent>
                        <Typography variant="body1">
                            Chatox is a chatting service. Well, it will be. Right now there is not much functionality,
                            the only working things are authorization and registration. But it will be developed gradually
                            in the future.
                        </Typography>
                    </CardContent>
                </Card>
            </Layout>
            <HasRole role="ROLE_USER">
                <CreateChatDialog/>
                <CreateChatFloatingActionButton/>
            </HasRole>
        </Grid>
    </Grid>
);
