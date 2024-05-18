import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle} from "@mui/material";
import {StickersGridList} from "./StickersGridList";
import {useLocalization, useStore} from "../../store";
import {useEntityById} from "../../entities";
import {useMobileDialog} from "../../utils/hooks";

export const StickerPackDialog: FunctionComponent = observer(() => {
    const {
        stickerPackDialog: {
            stickerPackId,
            stickerPackDialogOpen,
            setStickerPackId,
        },
        installedStickerPacks: {
            isStickerPackInstalled
        },
        stickerPackInstallation: {
            installStickerPack,
            pendingInstallationsMap
        },
        stickerPackUninstallation: {
            uninstallStickerPack,
            pendingUninstallationsMap
        }
    } = useStore();
    const {fullScreen} = useMobileDialog();
    const {l} = useLocalization();

    const stickerPack = useEntityById("stickerPacks", stickerPackId);

    if (!stickerPack) {
        return null;
    }

    const stickerPackInstalled = isStickerPackInstalled(stickerPack.id);

    return (
        <Dialog open={stickerPackDialogOpen}
                fullWidth
                maxWidth="sm"
                fullScreen={fullScreen}
                onClose={() => setStickerPackId(undefined)}
        >
            <DialogTitle>
                {l("sticker.pack.with-name", {name: stickerPack.name})}
            </DialogTitle>
            <DialogContent>
                <StickersGridList stickerPackId={stickerPack.id}/>
            </DialogContent>
            <DialogActions>
                <Button variant="text"
                        color="primary"
                        onClick={() => setStickerPackId(undefined)}
                >
                    {l("close")}
                </Button>
                {stickerPackInstalled
                    ? (
                        <Button variant="text"
                                color="primary"
                                onClick={() => uninstallStickerPack(stickerPack.id)}
                                disabled={Boolean(pendingInstallationsMap[stickerPack.id])}
                        >
                            {pendingUninstallationsMap[stickerPack.id] && <CircularProgress color="primary" size={15}/>}
                            {l("sticker.pack.uninstall")}
                        </Button>
                    )
                    : (
                        <Button variant="text"
                                color="primary"
                                onClick={() => installStickerPack(stickerPack.id)}
                                disabled={Boolean(pendingInstallationsMap[stickerPack.id])}
                        >
                            {pendingInstallationsMap[stickerPack.id] && <CircularProgress color="primary" size={15}/>}
                            {l("sticker.pack.install")}
                        </Button>
                    )
                }
            </DialogActions>
        </Dialog>
    );
});
