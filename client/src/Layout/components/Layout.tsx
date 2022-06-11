import React, {FunctionComponent, PropsWithChildren} from "react";
import {Grid} from "@mui/material";
import {createStyles, makeStyles} from "@mui/styles";

const useStyles = makeStyles(() => createStyles({
    defaultLayout: {
        paddingLeft: '2.08333333334%',
        paddingRight: '2.08333333334%',
        marginTop: 16
    }
}));

export const Layout: FunctionComponent<PropsWithChildren<{}>> = ({children}) => {
    const classes = useStyles();

    return (
        <Grid container className={classes.defaultLayout}>
            <Grid item xs={12}>
                {children}
            </Grid>
        </Grid>
    );
};
