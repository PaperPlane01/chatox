import React, {FunctionComponent} from "react";
import {Grid} from "@mui/material";
import {Layout} from "../Layout";
import {
    ChatManagementAppBar,
    ChatManagementTabsContainer
} from "../ChatManagement";
import {ConfirmChatDeletionDialog, SpecifyChatDeletionReasonDialog} from "../Chat";
import {ChatBlockingInfoDialog, UpdateChatBlockingDialog} from "../ChatBlocking";
import {ChatRoleInfoDialog, CreateChatRoleDialog} from "../ChatRole";

export const ChatManagementPage: FunctionComponent = () => (
    <Grid container>
        <Grid item xs={12}>
            <ChatManagementAppBar/>
        </Grid>
        <Grid item xs={12}>
            <Layout>
                <ChatManagementTabsContainer/>
            </Layout>
        </Grid>
        <ChatBlockingInfoDialog/>
        <UpdateChatBlockingDialog/>
        <ChatRoleInfoDialog/>
        <CreateChatRoleDialog/>
        <ConfirmChatDeletionDialog/>
        <SpecifyChatDeletionReasonDialog/>
    </Grid>
);

export default ChatManagementPage;
