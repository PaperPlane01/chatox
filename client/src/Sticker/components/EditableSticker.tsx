import React, {FunctionComponent, useState} from "react";
import {observer} from "mobx-react";
import {IconButton} from "@mui/material";
import {createStyles, makeStyles} from "@mui/styles";
import {ArrowLeft, ArrowRight, Delete, Edit} from "@mui/icons-material";
import clsx from "clsx";
import {StickerContainer} from "../stores";
import {useStore} from "../../store";

interface EditableStickerProps {
    stickerContainer: StickerContainer,
    index: number,
    stickersCount: number
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
    },
    hovered: {
        boxShadow: "inset 0 0 0 1000px rgba(0, 0, 0, 0.5)"
    }
}));

export const EditableSticker: FunctionComponent<EditableStickerProps> = observer(({
    stickerContainer,
    index,
    stickersCount
}) => {
    const {
        stickerPackCreation: {
            setEditedStickerId,
            setStickerDialogOpen,
            removeSticker,
            moveStickerBack,
            moveStickerForward
        }
    } = useStore();
    const [hovered, setHovered] = useState(false);
    const classes = useStyles();

    if (!stickerContainer.uploadContainer) {
        return null;
    }

    return (
        <div className={clsx(classes.imageWrapper, {[classes.hovered]: hovered})}
             onMouseOver={() => setHovered(true)}
             onMouseOut={() => setHovered(false)}
             onTouchStart={() => setHovered(true)}
             onTouchEnd={() => setHovered(false)}
        >
            <img src={stickerContainer.uploadContainer.uploadedFile
                ? stickerContainer.uploadContainer.uploadedFile.uri
                : stickerContainer.uploadContainer.url
            }
                 className={classes.image}
            />
            <div className={classes.buttonsContainer}>
                {index !== 0 && (
                    <IconButton size="small"
                                onClick={() => moveStickerBack(stickerContainer.localId)}
                                color="primary"
                    >
                        <ArrowLeft/>
                    </IconButton>
                )}
                {index !== stickersCount - 1 && stickersCount !== 1 && (
                    <IconButton size="small"
                                onClick={() => moveStickerForward(stickerContainer.localId)}
                                color="primary"
                    >
                        <ArrowRight/>
                    </IconButton>
                )}
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
