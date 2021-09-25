import React, {FunctionComponent} from "react";
import {Grid} from "@material-ui/core";
import {ChatAppBar} from "../ChatAppBar";
import {MessagesList} from "../Message";

export const NewPrivateChatPage: FunctionComponent = () => (
    <Grid container>
        <Grid item xs={12}>
            <ChatAppBar/>
        </Grid>
        <Grid item xs={12}>
            <MessagesList/>
        </Grid>
    </Grid>
);

export default NewPrivateChatPage;
