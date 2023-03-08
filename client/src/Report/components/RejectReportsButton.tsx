import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {BottomNavigationAction, CircularProgress} from "@mui/material";
import {Undo} from "@mui/icons-material";
import {useLocalization, useStore} from "../../store";

export const RejectReportsButton: FunctionComponent = observer(() => {
    const {
        declineReports: {
            pending,
            declineSelectedReports,
        }
    } = useStore();
    const {l} = useLocalization();

    return <BottomNavigationAction icon={pending ? <CircularProgress size={20}/> : <Undo/>}
                                   label={l("report.reject")}
                                   showLabel
                                   onClick={declineSelectedReports}
                                   disabled={pending}
    />;
});
