import React, {Fragment, FunctionComponent, useEffect} from "react";
import {observer} from "mobx-react";
import {useSnackbar} from "notistack";
import {useLocalization, useStore} from "../../store";

export const DeleteMessagesSnackbarManager: FunctionComponent = observer(() => {
    const {
        selectedReportedMessagesDeletion: {
            error,
            showSnackbar,
            setShowSnackbar
        }
    } = useStore();
    const {l} = useLocalization();
    const {enqueueSnackbar} = useSnackbar();

    useEffect(
        () => {
            if (showSnackbar) {
                if (error) {
                    enqueueSnackbar(l("report.messages.delete-messages.error"), {variant: "error"});
                } else {
                    enqueueSnackbar(l("report.messages.delete-messages.success"));
                }

                setShowSnackbar(false);
            }
        }
    );

    return <Fragment/>;
});
