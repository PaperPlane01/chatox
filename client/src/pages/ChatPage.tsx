import React, {FunctionComponent} from "react";
import {Grid, Typography} from "@material-ui/core";
import {AppBar} from "../AppBar";

export const ChatPage: FunctionComponent = () => (
    <Grid container>
        <Grid item xs={12}>
            <AppBar/>
        </Grid>
        <Grid item xs={12}>
            <Typography variant="body1">
                This page is under development
            </Typography>
        </Grid>
    </Grid>
);
