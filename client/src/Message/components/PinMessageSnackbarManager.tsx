import React, {FunctionComponent, useEffect, Fragment} from "react";
import {observer} from "mobx-react";
import {useSnackbar} from "notistack";
import {useLocalization, useStore} from "../../store/hooks";

export const PinMessageSnackbarManager: FunctionComponent = observer(() => {
    const {
        pinMessage: {
            showSnackbar,
            setShowSnackbar
        }
    } = useStore();
    const {l} = useLocalization();
    const {enqueueSnackbar} = useSnackbar();

    useEffect(
        () => {
            if (showSnackbar) {
                enqueueSnackbar(l("message.pin.success"));
                setShowSnackbar(false);
            }
        },
        [showSnackbar]
    );

    return <Fragment/>
});
