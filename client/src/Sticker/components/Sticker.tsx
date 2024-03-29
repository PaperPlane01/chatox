import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {createStyles, makeStyles} from "@mui/styles";
import {useStore} from "../../store";

interface StickerProps {
    stickerId: string,
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
    onClick
}) => {
    const {
        entities: {
            stickers: {
                findById: findSticker
            },
            uploads: {
                findById: findStickerImage
            }
        }
    } = useStore();
    const classes = useStyles();

    const sticker = findSticker(stickerId);
    const image = findStickerImage(sticker.imageId);

    const handleClick = (): void => {
        if (onClick) {
            onClick();
        }
    };

    return (
        <div className={classes.imageWrapper}
             onClick={handleClick}
        >
            <img src={`${image.uri}?size=512`}
                 className={classes.image}
            />
        </div>
    );
});
