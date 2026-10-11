import React, {FunctionComponent} from "react";
import {Grid} from "@mui/material";
import {Layout} from "../Layout/components";
import {
    ChatManagementAppBar,
    ChatManagementTabsContainer
} from "../ChatManagement/components";
import {ConfirmChatDeletionDialog, SpecifyChatDeletionReasonDialog} from "../Chat/components";
import {ChatBlockingInfoDialog, UpdateChatBlockingDialog} from "../ChatBlocking/components";
import {ChatRoleInfoDialog, CreateChatRoleDialog} from "../ChatRole/components";
import {ChatInviteInfoDialog, CreateChatInviteDialog, UpdateChatInviteDialog} from "../ChatInvite/components";

export const ChatManagementPage: FunctionComponent = () => (
    <Grid container>
        <Grid size={12}>
            <ChatManagementAppBar/>
        </Grid>
        <Grid size={12}>
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
        <ChatInviteInfoDialog/>
        <CreateChatInviteDialog/>
        <UpdateChatInviteDialog/>
    </Grid>
);

export default ChatManagementPage;
