import React, {FunctionComponent, ReactNode, Fragment} from "react";
import {observer} from "mobx-react";
import {Grid, Typography} from "@mui/material";

interface RewardPropertyProps {
    name: string,
    value: ReactNode
}

export const RewardProperty: FunctionComponent<RewardPropertyProps> = observer(({
    name,
    value
}) => (
    <Fragment>
        <Grid item xs={12} md={6}>
            <Typography>
                <strong>{name}</strong>
            </Typography>
            <Typography>{value}</Typography>
        </Grid>
    </Fragment>
));
