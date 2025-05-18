import React, {FunctionComponent, useState} from "react";
import {observer} from "mobx-react";
import {IconButton, Theme} from "@mui/material";
import {createStyles, makeStyles} from "@mui/styles";
import {ArrowLeft, ArrowRight, Delete, Edit} from "@mui/icons-material";
import clsx from "clsx";
import {StickerContainer} from "../stores";
import {StickerPackFormContext} from "../types";
import {useStickerPackForm} from "../hooks";

interface EditableStickerProps {
    stickerContainer: StickerContainer,
    index: number,
    stickersCount: number,
    context: StickerPackFormContext
}

const useStyles = makeStyles((theme: Theme) => createStyles({
    imageWrapper: {
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: "100%",
        border: `3px ${theme.palette.divider}`,
        borderRadius: 3,
        borderStyle: "dashed"
    },
    image: {
        maxWidth: "100%",
        maxHeight: "100%",
        height: "inherit",
        objectFit: "contain"
    },
    buttonsContainer: {
        alignSelf: "end"
    },
    hovered: {
        boxShadow: "inset 0 0 0 1000px rgba(0, 0, 0, 0.5)"
    }
}));

export const EditableSticker: FunctionComponent<EditableStickerProps> = observer(({
    stickerContainer,
    index,
    stickersCount,
    context
}) => {
    const {
        setEditedStickerId,
        setEditStickerDialogOpen,
        removeSticker,
        moveStickerBack,
        moveStickerForward
    } = useStickerPackForm(context);
    const [hovered, setHovered] = useState(false);
    const classes = useStyles();

    if (!stickerContainer.uploadContainer) {
        return null;
    }

    return (
        <div className={classes.imageWrapper}>
            <div className={classes.buttonsContainer}>
                {index !== 0 && (
                    <IconButton size="small"
                                onClick={() => moveStickerBack(stickerContainer.id)}
                                color="primary"
                    >
                        <ArrowLeft/>
                    </IconButton>
                )}
                {index !== stickersCount - 1 && stickersCount !== 1 && (
                    <IconButton size="small"
                                onClick={() => moveStickerForward(stickerContainer.id)}
                                color="primary"
                    >
                        <ArrowRight/>
                    </IconButton>
                )}
                <IconButton size="small"
                            onClick={() => {
                                setEditedStickerId(stickerContainer.id);
                                setEditStickerDialogOpen(true)
                            }}
                            color="primary"
                >
                    <Edit/>
                </IconButton>
                <IconButton size="small"
                            onClick={() => removeSticker(stickerContainer.id)}
                            color="primary"
                >
                    <Delete/>
                </IconButton>
            </div>
            <img src={stickerContainer.uploadContainer.uploadedFile
                ? stickerContainer.uploadContainer.uploadedFile.uri
                : stickerContainer.uploadContainer.url
            }
                 className={clsx(classes.image, {[classes.hovered]: hovered})}
                 onMouseOver={() => setHovered(true)}
                 onMouseOut={() => setHovered(false)}
                 onTouchStart={() => setHovered(true)}
                 onTouchEnd={() => setHovered(false)}
                 onFocus={() => setHovered(true)}
                 onBlur={() => setHovered(false)}
            />
        </div>
    );
});
