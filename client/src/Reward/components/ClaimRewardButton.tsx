import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {IconButton, Typography} from "@mui/material";
import {Wallet} from "@mui/icons-material"
import {useStore} from "../../store";

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

    if (showClaimedAmount) {
        return (
            <Typography sx={theme => ({color: theme.palette.primary.main})}>
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
