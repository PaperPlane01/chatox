import React, {Fragment, FunctionComponent} from "react";
import {Grid, Hidden} from "@material-ui/core";
import {
    ChatAppBar,
    ChatInfoContainer,
    ChatInfoDialog,
    ChatsOfCurrentUserList,
    MessagesList,
    UpdateChatDialog
} from "../Chat";
import {MessageDialog, UpdateMessageDialog, AttachedFilesDialog} from "../Message";
import {
    BlockUserInChatByIdOrSlugDialog,
    ChatBlockingInfoDialog,
    ChatBlockingsDialog,
    CreateChatBlockingDialog,
    UpdateChatBlockingDialog
} from "../ChatBlocking";

export const ChatPage: FunctionComponent = () => (
    <Fragment>
        <Grid container>
            <Grid item xs={12}>
                <ChatAppBar/>
            </Grid>
            <Grid item xs={12}>
                <Grid item xs={12}
                      style={{display: "flex"}}
                      justify="space-between"
                >
                    <Hidden mdDown>
                        <ChatsOfCurrentUserList/>
                    </Hidden>
                    <Grid container>
                        <Grid item xs={12} lg={9}>
                            <MessagesList/>
                        </Grid>
                        <Hidden mdDown>
                            <Grid item lg={3}>
                                <ChatInfoContainer/>
                            </Grid>
                        </Hidden>
                    </Grid>
                </Grid>
            </Grid>
            <CreateChatBlockingDialog/>
            <ChatBlockingsDialog/>
            <ChatBlockingInfoDialog/>
            <UpdateChatBlockingDialog/>
            <ChatInfoDialog/>
            <BlockUserInChatByIdOrSlugDialog/>
            <UpdateChatDialog/>
            <MessageDialog/>
            <UpdateMessageDialog/>
            <AttachedFilesDialog/>
        </Grid>
    </Fragment>
);

export default ChatPage;
