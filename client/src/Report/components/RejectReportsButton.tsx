import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {BottomNavigationAction, CircularProgress} from "@material-ui/core";
import {Undo} from "@material-ui/icons";
import {useLocalization, useStore} from "../../store/hooks";

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
