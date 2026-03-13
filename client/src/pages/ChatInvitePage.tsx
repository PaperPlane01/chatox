import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Grid} from "@mui/material";
import {AppBar} from "../AppBar";
import {Layout} from "../Layout";
import {ChatInviteCardWrapper} from "../ChatInvite";

export const ChatInvitePage: FunctionComponent = observer(() => (
    <Grid container>
        <Grid size={12}>
            <AppBar/>
        </Grid>
        <Grid size={12}>
            <Layout>
                <ChatInviteCardWrapper/>
            </Layout>
        </Grid>
    </Grid>
));

export default ChatInvitePage;
