import React, {FunctionComponent} from "react";
import {Grid, createStyles, makeStyles} from "@material-ui/core";

const useStyles = makeStyles(() => createStyles({
    defaultLayout: {
        paddingLeft: '2.08333333334%',
        paddingRight: '2.08333333334%',
        marginTop: 16
    }
}));

export const Layout: FunctionComponent<{}> = ({children}) => {
    const classes = useStyles();

    return (
        <Grid container className={classes.defaultLayout}>
            <Grid item xs={12}>
                {children}
            </Grid>
        </Grid>
    )
};
