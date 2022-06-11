import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {FormControlLabel, Switch} from "@mui/material";
import {useLocalization, useStore} from "../../store";

export const ShowNotViewedOnlySwitch: FunctionComponent = observer(() => {
    const {l} = useLocalization();
    const {
        currentReportsList: {
            currentReportsList: {
                showNotViewedOnly,
                setShowNotViewedOnly
            }
        }
    } = useStore();

    return (
        <FormControlLabel control={(
            <Switch checked={showNotViewedOnly}
                    onChange={() => setShowNotViewedOnly(!showNotViewedOnly)}
            />
        )}
                          label={l("report.list.show-not-viewed-only")}
        />
    );
});
