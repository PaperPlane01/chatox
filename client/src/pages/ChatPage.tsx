import React, {FunctionComponent, Fragment} from "react";
import {Grid, Hidden} from "@material-ui/core";
import {ChatAppBar, ChatsOfCurrentUserList, MessagesList} from "../Chat";

const ScrollLock = require("react-scrolllock").default;

export const ChatPage: FunctionComponent = () => (
    <ScrollLock>
        <Grid container>
            <Grid item xs={12}>
                <ChatAppBar/>
            </Grid>
            <Grid item xs={12}>
                <Grid item xs={12} style={{display: "flex"}}>
                    <Hidden mdDown>
                        <ChatsOfCurrentUserList/>
                    </Hidden>
                    <MessagesList/>
                </Grid>
            </Grid>
        </Grid>
    </ScrollLock>
);
