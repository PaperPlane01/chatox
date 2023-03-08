import React, {FunctionComponent} from "react";
import {Grid} from "@mui/material";
import {ChangePasswordContainer} from "../../User";
import {EditEmailContainer} from "../../EmailUpdate";

export const SecurityTabWrapper: FunctionComponent = () => (
    <Grid container spacing={2}>
        <Grid item xs={12}>
            <ChangePasswordContainer/>
        </Grid>
        <Grid item xs={12}>
            <EditEmailContainer/>
        </Grid>
    </Grid>
);
