import React, {FunctionComponent, Fragment} from "react";
import {Grid} from "@material-ui/core";
import {ScheduledMessagesAppBar, ScheduledMessagesList} from "../Message";

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
    </Fragment>
);

export default ScheduledMessagesPage;
