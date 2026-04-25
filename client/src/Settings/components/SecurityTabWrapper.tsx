import React, {FunctionComponent} from "react";
import {Grid} from "@mui/material";
import {ChangePasswordContainer} from "../../User";
import {EditEmailContainer} from "../../EmailUpdate";

export const SecurityTabWrapper: FunctionComponent = () => (
    <Grid container spacing={2}>
        <Grid size={12}>
            <ChangePasswordContainer/>
        </Grid>
        <Grid size={12}>
            <EditEmailContainer/>
        </Grid>
    </Grid>
);
