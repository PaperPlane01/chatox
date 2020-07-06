import React, {FunctionComponent} from "react";
import {Grid, Hidden} from "@material-ui/core";
import {
    ChatAppBar,
    ChatInfoContainer,
    ChatInfoDialog,
    ChatsOfCurrentUserList,
    MessagesList,
    UpdateChatDialog
} from "../Chat";
import {MessagesListBottom} from "../Message";
import {
    BlockUserInChatByIdOrSlugDialog,
    ChatBlockingInfoDialog,
    ChatBlockingsDialog,
    CreateChatBlockingDialog,
    UpdateChatBlockingDialog
} from "../ChatBlocking";

const ScrollLock = require("react-scrolllock").default;

export const ChatPage: FunctionComponent = () => (
    <ScrollLock>
        <Grid container>
            <Grid item xs={12}>
                <ChatAppBar/>
            </Grid>
            <Grid item xs={12}>
                <Grid item xs={12} style={{display: "flex"}}
                      justify="space-between"
                >
                    <Hidden mdDown>
                        <ChatsOfCurrentUserList/>
                    </Hidden>
                    <Grid container>
                        <Grid item xs={12} lg={9}>
                            <MessagesList/>
                            <MessagesListBottom/>
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
        </Grid>
    </ScrollLock>
);
