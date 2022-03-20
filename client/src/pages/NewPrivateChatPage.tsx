import React, {FunctionComponent} from "react";
import {Grid, Hidden} from "@material-ui/core";
import {ChatAppBar} from "../ChatAppBar";
import {MessagesList} from "../Message";
import {ChatsOfCurrentUserList} from "../Chat";

export const NewPrivateChatPage: FunctionComponent = () => (
    <Grid container>
        <Grid item xs={12}>
            <ChatAppBar/>
        </Grid>
        <Grid item
              xs={12}
              style={{display: "flex"}}
              justify="space-between"
        >
            <Hidden mdDown>
                <ChatsOfCurrentUserList/>
            </Hidden>
            <Grid container>
                <Grid item xs={12}>
                    <MessagesList/>
                </Grid>
            </Grid>
        </Grid>
    </Grid>
);

export default NewPrivateChatPage;
