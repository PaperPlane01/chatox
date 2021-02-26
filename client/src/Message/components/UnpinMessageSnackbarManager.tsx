import React, {FunctionComponent, Fragment, useEffect} from "react";
import {observer} from "mobx-react";
import {useSnackbar} from "notistack";
import {useLocalization, useStore} from "../../store/hooks";

export const UnpinMessageSnackbarManager: FunctionComponent = observer(() => {
    const {
        unpinMessage: {
            showSnackbar,
            setShowSnackbar
        }
    } = useStore();
    const {l} = useLocalization();
    const {enqueueSnackbar} = useSnackbar();

    useEffect(
        () => {
            if (showSnackbar) {
                enqueueSnackbar(l("message.unpin.success"));
                setShowSnackbar(false);
            }
        }
    );

    return <Fragment/>
});
