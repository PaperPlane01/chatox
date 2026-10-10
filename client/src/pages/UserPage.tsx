import React, {Fragment, FunctionComponent} from "react";
import {Grid} from "@mui/material";
import {makeStyles} from "tss-react/mui";
import {commonStyles} from "../style";
import {AppBar} from "../AppBar/components";
import {Layout} from "../Layout/components";
import {CreateUserProfilePhotoDialog, UserPhotosDialog, UserPhotosLightbox, UserProfileInfo} from "../User/components";
import {ReportUserDialog} from "../Report/components";
import {UserInteractionsHistoryDialog} from "../UserInteraction/components";

const useStyles = makeStyles()(() => ({
    centered: {
        ...commonStyles.centered,
        width: "100%"
    }
}));

export const UserPage: FunctionComponent = () => {
    const { classes } = useStyles();

    return (
       <Fragment>
           <Grid container>
               <Grid size={12}>
                   <AppBar/>
               </Grid>
               <Grid size={12}>
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
