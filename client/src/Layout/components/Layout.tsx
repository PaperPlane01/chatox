import React, {FunctionComponent, PropsWithChildren} from "react";
import {Grid} from "@mui/material";
import {makeStyles} from "tss-react/mui";

const useStyles = makeStyles()(() => ({
    defaultLayout: {
        paddingLeft: '2.08333333334%',
        paddingRight: '2.08333333334%',
        marginTop: 16
    }
}));

export const Layout: FunctionComponent<PropsWithChildren<{}>> = ({children}) => {
    const {classes} = useStyles();

    return (
        <Grid container className={classes.defaultLayout}>
            <Grid size={12}>
                {children}
            </Grid>
        </Grid>
    );
};
