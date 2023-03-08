import React, {FunctionComponent, useEffect, Fragment} from "react";
import {observer} from "mobx-react";
import {useSnackbar} from "notistack";
import {useStore, useLocalization} from "../../store";

export const RejectReportsSnackbarManager: FunctionComponent = observer(() => {
    const {
        declineReports: {
            showSnackbar,
            setShowSnackbar
        }
    } = useStore();
    const {l} = useLocalization();
    const {enqueueSnackbar} = useSnackbar();

    useEffect(
        () => {
            if (showSnackbar) {
                enqueueSnackbar(l("report.reject.success"));
                setShowSnackbar(false);
            }
        }
    );

    return <Fragment/>;
});
