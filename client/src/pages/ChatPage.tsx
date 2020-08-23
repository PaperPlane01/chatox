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
import {MessageDialog, UpdateMessageDialog} from "../Message";
import {
    BlockUserInChatByIdOrSlugDialog,
    ChatBlockingInfoDialog,
    ChatBlockingsDialog,
    CreateChatBlockingDialog,
    UpdateChatBlockingDialog
} from "../ChatBlocking";
import {AppBar} from "../AppBar/components";

const ScrollLock = require("react-scrolllock").default;

export const ChatPage: FunctionComponent = () => {
    const content = (
        <Grid container>
            <Grid item xs={12}>
                <AppBar/>
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
        </Grid>
    )

    return (
        <Fragment>
            <Hidden lgUp>
                {content}
            </Hidden>
            <Hidden mdDown>
                <Fragment>
                    {content}
                </Fragment>
            </Hidden>
        </Fragment>
    )
}
