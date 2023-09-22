import React, {Fragment, FunctionComponent} from "react";
import {Grid} from "@mui/material";
import {createStyles, makeStyles} from "@mui/styles";
import {AppBar} from "../AppBar";
import {Layout} from "../Layout";
import {CreateUserProfilePhotoDialog, UserPhotosDialog, UserPhotosLightbox, UserProfileInfo} from "../User";
import {ReportUserDialog} from "../Report";
import {UserInteractionsHistoryDialog} from "../UserInteraction";

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
       <Fragment>
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
           <UserInteractionsHistoryDialog/>
           <UserPhotosDialog/>
           <UserPhotosLightbox/>
           <CreateUserProfilePhotoDialog/>
       </Fragment>
    );
};

export default UserPage;
