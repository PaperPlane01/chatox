import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {FormControlLabel, Switch} from "@mui/material";
import {useStore, useLocalization} from "../../store";

export const ShowActiveRewardsOnlySwitch: FunctionComponent = observer(() => {
    const {
        rewardsList: {
            showActiveOnly,
            setShowActiveOnly
        }
    } = useStore();
    const {l} = useLocalization();

    return (
        <FormControlLabel control={
            <Switch checked={showActiveOnly}
                    onChange={() => setShowActiveOnly(!showActiveOnly)}
            />
        }
                          label={l("reward.list.active-only")}
        />
    );
});
