import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Grid, CircularProgress, Typography} from "@mui/material";
import {createStyles, makeStyles} from "@mui/styles";
import {CreateRewardButton} from "./CreateRewardButton";
import {RewardCard} from "./RewardCard";
import {ShowActiveRewardsOnlySwitch} from "./ShowActiveRewardsOnlySwitch";
import {useStore, useLocalization} from "../../store";
import {commonStyles} from "../../style";

const useStyles = makeStyles(() => createStyles({
    centered: commonStyles.centered
}));

export const RewardList: FunctionComponent = observer(() => {
    const {
        rewardsList: {
            fetchingState: {
                pending
            },
            rewardsIds
        }
    } = useStore();
    const {l} = useLocalization();
    const classes = useStyles();

    return (
        <Grid container spacing={2} justifyItems="flex-end">
            <Grid item xs={12}>
                <Typography variant="h4">
                    {l("reward.list")}
                </Typography>
            </Grid>
            <Grid item xs={12}>
                <ShowActiveRewardsOnlySwitch/>
                <CreateRewardButton/>
            </Grid>
            {rewardsIds.map(rewardId => (
                <Grid item xs={12} lg={6}>
                    <RewardCard rewardId={rewardId}/>
                </Grid>
            ))}
            {pending && (
                <Grid item xs={12}>
                    <CircularProgress className={classes.centered}/>
                </Grid>
            )}
        </Grid>
    );
});
