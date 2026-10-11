import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Grid} from "@mui/material";
import {AppBar} from "../AppBar/components";
import {Layout} from "../Layout/components";
import {PendingChatsList} from "../Chat/components";

export const PendingChatsListPage: FunctionComponent = observer(() => (
    <Grid container>
        <Grid size={12}>
            <AppBar/>
        </Grid>
        <Grid size={12}>
            <Layout>
                <PendingChatsList/>
            </Layout>
        </Grid>
    </Grid>
));

export default PendingChatsListPage;
