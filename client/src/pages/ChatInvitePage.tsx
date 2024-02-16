import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Grid} from "@mui/material";
import {AppBar} from "../AppBar";
import {Layout} from "../Layout";
import {ChatInviteCardWrapper} from "../ChatInvite";

export const ChatInvitePage: FunctionComponent = observer(() => (
    <Grid container>
        <Grid item xs={12}>
            <AppBar/>
        </Grid>
        <Grid item xs={12}>
            <Layout>
                <ChatInviteCardWrapper/>
            </Layout>
        </Grid>
    </Grid>
));

export default ChatInvitePage;
