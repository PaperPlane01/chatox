import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle} from "@material-ui/core";
import {StickersGridList} from "./StickersGridList";
import {useLocalization, useStore} from "../../store";
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
        },
        entities: {
            stickerPacks: {
                findById: findStickerPack
            }
        }
    } = useStore();
    const {fullScreen} = useMobileDialog();
    const {l} = useLocalization();

    if (!stickerPackId) {
        return null;
    }

    const stickerPack = findStickerPack(stickerPackId);
    const stickerPackInstalled = isStickerPackInstalled(stickerPackId);

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
                <StickersGridList stickerPackId={stickerPackId}/>
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
                                onClick={() => uninstallStickerPack(stickerPackId)}
                                disabled={Boolean(pendingInstallationsMap[stickerPackId])}
                        >
                            {pendingUninstallationsMap[stickerPackId] && <CircularProgress color="primary" size={15}/>}
                            {l("sticker.pack.uninstall")}
                        </Button>
                    )
                    : (
                        <Button variant="text"
                                color="primary"
                                onClick={() => installStickerPack(stickerPackId)}
                                disabled={Boolean(pendingInstallationsMap[stickerPackId])}
                        >
                            {pendingInstallationsMap[stickerPackId] && <CircularProgress color="primary" size={15}/>}
                            {l("sticker.pack.install")}
                        </Button>
                    )
                }
            </DialogActions>
        </Dialog>
    );
});
