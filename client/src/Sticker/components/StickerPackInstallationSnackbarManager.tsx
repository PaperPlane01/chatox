import React, {FunctionComponent, useEffect, Fragment} from "react";
import {observer} from "mobx-react";
import {useSnackbar} from "notistack";
import {useStore, useLocalization} from "../../store";

export const StickerPackInstallationSnackbarManager: FunctionComponent = observer(() => {
    const {
        stickerPackInstallation: {
            showSnackbar,
            setShowSnackbar
        }
    } = useStore();
    const {l} = useLocalization();
    const {enqueueSnackbar} = useSnackbar();

    useEffect(() => {
        if (showSnackbar) {
            enqueueSnackbar(l("sticker.pack.install.success"));
            setShowSnackbar(false);
        }
    });

    return <Fragment/>
})
