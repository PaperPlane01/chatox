import React, {Fragment, FunctionComponent} from "react";
import {Grid, Typography} from "@mui/material";
import {CreateRewardDialog, RewardList, UpdateRewardDialog} from "../Reward";
import {AppBar} from "../AppBar";
import {Layout} from "../Layout";
import {HasRole} from "../Authorization";

export const RewardsManagementPage: FunctionComponent = () => (
   <Fragment>
       <Grid container>
           <Grid item xs={12}>
               <AppBar title="reward.list"/>
           </Grid>
           <Grid>
               <Layout>
                   <HasRole role="ROLE_ADMIN"
                            alternative={
                                <Typography>
                                    This page is only available to admins
                                </Typography>
                            }>
                       <RewardList/>
                   </HasRole>
               </Layout>
           </Grid>
       </Grid>
       <CreateRewardDialog/>
       <UpdateRewardDialog/>
   </Fragment>
);

export default RewardsManagementPage;