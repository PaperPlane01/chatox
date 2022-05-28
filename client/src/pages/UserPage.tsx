import React, {FunctionComponent} from "react";
import { Grid } from "@mui/material";
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import {AppBar} from "../AppBar";
import {Layout} from "../Layout";
import {UserProfileInfo} from "../User";
import {ReportUserDialog} from "../Report";

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
            <ReportUserDialog/>
        </Grid>
    )
};

export default UserPage;
