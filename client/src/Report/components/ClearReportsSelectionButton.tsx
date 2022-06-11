import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {IconButton, Tooltip} from "@mui/material";
import {Close} from "@mui/icons-material";
import {useStore, useLocalization} from "../../store";

export const ClearReportsSelectionButton: FunctionComponent = observer(() => {
    const {
        currentReportsList: {
            currentReportsList: {
                clearSelection
            }
        }
    } = useStore();
    const {l} = useLocalization();

    return (
        <Tooltip title={l("report.list.clear-selection")}>
            <IconButton onClick={clearSelection} size="large">
                <Close/>
            </IconButton>
        </Tooltip>
    );
});
