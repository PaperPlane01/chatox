import React, {Fragment, FunctionComponent, useEffect} from "react";
import {observer} from "mobx-react";
import {useSnackbar} from "notistack";
import {useStore, useLocalization} from "../../store/hooks";

export const PublishScheduledMessageSnackbarManager: FunctionComponent = observer(() => {
    const {
        publishScheduledMessage: {
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
                    enqueueSnackbar(l("message.delayed-message.publish.error"), {variant: "error"});
                } else {
                    enqueueSnackbar(l("message.delayed-message.publish.success"));
                }

                setShowSnackbar(false);
            }
        }
    );

    return <Fragment/>
});
