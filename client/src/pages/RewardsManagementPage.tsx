import React, {Fragment, FunctionComponent} from "react";
import {Grid, Typography} from "@mui/material";
import {CreateRewardDialog, RewardList, UpdateRewardDialog} from "../Reward/components";
import {AppBar} from "../AppBar/components";
import {Layout} from "../Layout/components";
import {HasRole} from "../Authorization/components";

export const RewardsManagementPage: FunctionComponent = () => (
   <Fragment>
       <Grid container>
           <Grid size={12}>
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