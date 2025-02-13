import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {createStyles, makeStyles} from "@mui/styles";
import {useEntityById, useEntitySelector} from "../../entities";

interface StickerProps {
    stickerId: string,
    size?: number,
    onClick?: () => void
}

const useStyles = makeStyles(() => createStyles({
    imageWrapper: {
        display: "inline-block",
        position: "relative",
        height: "100%",
        width: "100%",
        cursor: "pointer"
    },
    image: {
        maxWidth: "100%",
        maxHeight: "100%",
        height: "inherit",
        objectFit: "contain"
    }
}));

export const Sticker: FunctionComponent<StickerProps> = observer(({
    stickerId,
    size,
    onClick
}) => {
    const classes = useStyles();

    const sticker = useEntityById("stickers", stickerId);
    const upload = useEntitySelector("uploads", entities => entities.uploads.findSticker(sticker.uploadId));
    const sizeQuery = size ? `?size=${size}` : "";

    const handleClick = (): void => {
        if (onClick) {
            onClick();
        }
    };

    return (
        <div className={classes.imageWrapper}
             onClick={handleClick}
        >
            <img src={`${upload.uri}${sizeQuery}`}
                 className={classes.image}
            />
        </div>
    );
});
