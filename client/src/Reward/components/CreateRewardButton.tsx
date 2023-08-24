import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Button} from "@mui/material";
import {useStore, useLocalization} from "../../store";

export const CreateRewardButton: FunctionComponent = observer(() => {
    const {
        rewardCreation: {
            setCreateRewardDialogOpen
        }
    } = useStore();
    const {l} = useLocalization();

    return (
        <Button variant="contained"
                color="primary"
                onClick={() => setCreateRewardDialogOpen(true)}
        >
            {l("reward.create")}
        </Button>
    );
});
