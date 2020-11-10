import React, {FunctionComponent} from "react";
import {Grid, createStyles, makeStyles} from "@material-ui/core";
import {AppBar} from "../AppBar";
import {Layout} from "../Layout";
import {UserProfileInfo} from "../User";

const useStyles = makeStyles(() => createStyles({
    centered: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        width: "100%"
    }
}));

export const UserPage: FunctionComponent = () => {
    const classes = useStyles();

    return (
        <Grid container>
            <Grid item xs={12}>
                <AppBar/>
            </Grid>
            <Grid item xs={12}>
                <Layout>
                    <div className={classes.centered}>
                        <UserProfileInfo/>
                    </div>
                </Layout>
            </Grid>
        </Grid>
    )
};

export default UserPage;
