import React, {FunctionComponent, useEffect, Fragment} from "react";
import {observer} from "mobx-react";
import {useSnackbar} from "notistack";
import {useStore, useLocalization} from "../../store";

export const StickerPackUninstallationSnackbarManager: FunctionComponent = observer(() => {
    const {
        stickerPackUninstallation: {
            showSnackbar,
            setShowSnackbar
        }
    } = useStore();
    const {l} = useLocalization();
    const {enqueueSnackbar} = useSnackbar();

    useEffect(() => {
        if (showSnackbar) {
            enqueueSnackbar(l("sticker.pack.uninstall.success"));
            setShowSnackbar(false);
        }
    });

    return <Fragment/>
});
