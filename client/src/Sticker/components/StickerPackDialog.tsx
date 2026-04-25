import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {
    Button,
    CircularProgress,
    CSSProperties,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle
} from "@mui/material";
import {StickersGridList} from "./StickersGridList";
import {StickerPackInstallationButtons} from "./StickerPackInstallationButtons";
import {StickerPackMenu} from "./StickerPackMenu";
import {useLocalization, useStore} from "../../store";
import {useEntityById} from "../../entities";
import {useMobileDialog} from "../../utils/hooks";
import {commonStyles} from "../../style";

export const StickerPackDialog: FunctionComponent = observer(() => {
    const {
        stickerPackDialog: {
            stickerPackId,
            stickerPackDialogOpen,
            pending,
            setStickerPackId,
        }
    } = useStore();
    const {fullScreen} = useMobileDialog();
    const {l} = useLocalization();

    const stickerPack = useEntityById("stickerPacks", stickerPackId);

    if (!stickerPack && !pending) {
        return null;
    }

    return (
        <Dialog open={stickerPackDialogOpen}
                fullWidth
                maxWidth="sm"
                fullScreen={fullScreen}
                onClose={() => setStickerPackId(undefined)}
        >
            {stickerPack && (
                <DialogTitle>
                    {l("sticker.pack.with-name", {name: stickerPack.name})}
                    <div style={{float: "right"}}>
                        <StickerPackMenu stickerPackId={stickerPack.id}/>
                    </div>
                </DialogTitle>
            )}
            <DialogContent>
                {stickerPack && (
                    <StickersGridList stickerPackId={stickerPack.id}
                                      stickerSize={256}
                    />
                )}
                {pending && <CircularProgress size={25} style={commonStyles.centered as unknown as CSSProperties}/>}
            </DialogContent>
            <DialogActions>
                <Button variant="text"
                        color="primary"
                        onClick={() => setStickerPackId(undefined)}
                >
                    {l("close")}
                </Button>
                {stickerPack && <StickerPackInstallationButtons stickerPackId={stickerPack.id}/>}
            </DialogActions>
        </Dialog>
    );
});
