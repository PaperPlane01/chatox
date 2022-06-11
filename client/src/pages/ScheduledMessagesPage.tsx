import React, {FunctionComponent, Fragment} from "react";
import {Grid} from "@mui/material";
import {
    ScheduledMessagesAppBar,
    ScheduledMessagesList,
    PublishScheduledMessageSnackbarManager,
    UpdateScheduledMessageDialog
} from "../Message";

export const ScheduledMessagesPage: FunctionComponent = () => (
    <Fragment>
        <Grid container>
            <Grid item xs={12}>
                <ScheduledMessagesAppBar/>
            </Grid>
            <Grid item xs={12}>
                <ScheduledMessagesList/>
            </Grid>
        </Grid>
        <PublishScheduledMessageSnackbarManager/>
        <UpdateScheduledMessageDialog/>
    </Fragment>
);

export default ScheduledMessagesPage;
