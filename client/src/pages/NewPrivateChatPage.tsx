import React, {FunctionComponent} from "react";
import {Grid, Hidden} from "@mui/material";
import {ChatAppBar} from "../ChatAppBar";
import {MessagesListWrapper} from "../Message";
import {ChatsOfCurrentUserList} from "../Chat";

export const NewPrivateChatPage: FunctionComponent = () => (
    <Grid container>
        <Grid item xs={12}>
            <ChatAppBar/>
        </Grid>
        <Grid item
              xs={12}
              style={{display: "flex"}}
              justifyContent="space-between"
        >
            <Hidden xlDown>
                <ChatsOfCurrentUserList/>
            </Hidden>
            <Grid container>
                <Grid item xs={12}>
                    <MessagesListWrapper/>
                </Grid>
            </Grid>
        </Grid>
    </Grid>
);

export default NewPrivateChatPage;
