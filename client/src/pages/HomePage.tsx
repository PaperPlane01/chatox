import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Card, CardContent, CardHeader, Grid, Typography} from "@mui/material";
import {usePermissions} from "../store/hooks";
import {Layout} from "../Layout/components";
import {AppBar} from "../AppBar/components";
import {HasRole} from "../Authorization/components";
import {CreateChatDialog, CreateChatFloatingActionButton, PopularChatsList} from "../Chat/components";

export const HomePage: FunctionComponent = observer(() => {
    const {
        chats: {
            canCreateChat
        }
    } = usePermissions();

    return (
        <Grid container>
            <Grid size={12}>
                <AppBar/>
            </Grid>
            <Grid size={12}>
                <Layout>
                    <Grid container spacing={2}>
                        <Grid size={12}>
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
                        <Grid size={12}>
                            <PopularChatsList/>
                        </Grid>
                    </Grid>
                </Layout>
                <HasRole role="ROLE_USER"
                         additionalCondition={canCreateChat}
                >
                    <CreateChatDialog/>
                    <CreateChatFloatingActionButton/>
                </HasRole>
            </Grid>
        </Grid>
    )
});

export default HomePage;
