import React, {FunctionComponent} from "react";
import {Card, CardContent, CardHeader, Grid, Typography} from "@material-ui/core";
import {Layout} from "../Layout";
import {AppBar} from "../AppBar";
import {HasRole} from "../Authorization";
import {CreateChatDialog, CreateChatFloatingActionButton, PopularChatsList} from "../Chat";
import {canCreateChat} from "../Chat/permissions";

export const HomePage: FunctionComponent = () => (
    <Grid container>
        <Grid item xs={12}>
            <AppBar/>
        </Grid>
        <Grid item xs={12}>
            <Layout>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
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
                    </Grid>
                    <Grid item xs={12}>
                        <PopularChatsList/>
                    </Grid>
                </Grid>
            </Layout>
            <HasRole role="ROLE_USER"
                     additionalCondition={authorizationStore => canCreateChat(authorizationStore)}
            >
                <CreateChatDialog/>
                <CreateChatFloatingActionButton/>
            </HasRole>
        </Grid>
    </Grid>
);

export default HomePage;
