import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {IconButton, Theme, Typography} from "@mui/material";
import {createStyles, makeStyles} from "@mui/styles";
import {Wallet} from "@mui/icons-material"
import {useStore} from "../../store";

const useStyles = makeStyles((theme: Theme) => createStyles({
    rewardText: {
        color: theme.palette.primary.main,
        display: "inline-flex",
        alignItems: "center",
        padding: theme.spacing(1)
    }
}));

export const ClaimRewardButton: FunctionComponent = observer(() => {
    const {
        claimableRewards: {
            claimableRewardsAvailable
        },
        rewardClaim: {
            pending,
            claimedAmount,
            showClaimedAmount,
            claimNextReward
        }
    } = useStore();
    const classes = useStyles();

    if (showClaimedAmount) {
        return (
            <Typography className={classes.rewardText}>
                <strong>+{claimedAmount}</strong>
            </Typography>
        );
    } else if (claimableRewardsAvailable || pending) {
        return (
            <IconButton onClick={claimNextReward}
                        disabled={pending}
                        color="primary"
            >
                <Wallet/>
            </IconButton>
        );
    } else return null;
});
