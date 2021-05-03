import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {IconButton, Tooltip} from "@material-ui/core";
import {Close} from "@material-ui/icons";
import {useStore, useLocalization} from "../../store/hooks";

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
            <IconButton onClick={clearSelection}>
                <Close/>
            </IconButton>
        </Tooltip>
    );
});
