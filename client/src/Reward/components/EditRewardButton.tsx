import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {IconButton} from "@mui/material";
import {Edit} from "@mui/icons-material";
import {useStore} from "../../store";

interface EditRewardButtonProps {
    rewardId: string
}

export const EditRewardButton: FunctionComponent<EditRewardButtonProps> = observer(({
    rewardId
}) => {
    const {
        rewardUpdate: {
            setRewardId
        }
    } = useStore();

    return (
        <IconButton onClick={() => setRewardId(rewardId)}>
            <Edit/>
        </IconButton>
    );
});
