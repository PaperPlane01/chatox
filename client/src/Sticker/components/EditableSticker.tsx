import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {IconButton} from "@mui/material";
import {createStyles, makeStyles} from "@mui/styles";
import {Edit, Delete} from "@mui/icons-material";
import {StickerContainer} from "../stores";
import {useLocalization, useStore} from "../../store";

interface EditableStickerProps {
    stickerContainer: StickerContainer
}

const useStyles = makeStyles(() => createStyles({
    imageWrapper: {
        display: "inline-block",
        position: "relative",
        height: "100%",
        width: "100%"
    },
    image: {
        maxWidth: "100%",
        maxHeight: "100%",
        height: "inherit",
        objectFit: "contain"
    },
    buttonsContainer: {
        position: "absolute",
        top: 0,
        left: "60%"
    }
}));

export const EditableSticker: FunctionComponent<EditableStickerProps> = observer(({
    stickerContainer
}) => {
    const {
        stickerPackCreation: {
            setEditedStickerId,
            setStickerDialogOpen,
            removeSticker
        }
    } = useStore();
    const classes = useStyles();

    if (!stickerContainer.uploadContainer) {
        return null;
    }

    return (
        <div className={classes.imageWrapper}>
            <img src={stickerContainer.uploadContainer.uploadedFile ? stickerContainer.uploadContainer.uploadedFile.uri : stickerContainer.uploadContainer.url}
                 className={classes.image}
            />
            <div className={classes.buttonsContainer}>
                <IconButton size="small"
                            onClick={() => {
                                setEditedStickerId(stickerContainer.localId);
                                setStickerDialogOpen(true)
                            }}
                            color="primary"
                >
                    <Edit/>
                </IconButton>
                <IconButton size="small"
                            onClick={() => removeSticker(stickerContainer.localId)}
                            color="primary"
                >
                    <Delete/>
                </IconButton>
            </div>
        </div>
    );
});
