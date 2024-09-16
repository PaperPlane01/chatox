import React, {FunctionComponent, useEffect, useRef, useState} from "react";
import {observer} from "mobx-react";
import {ImageList, ImageListItem} from "@mui/material";
import {createStyles, makeStyles} from "@mui/styles";
import {useStore} from "../../store";
import {useEntityById, useEntitySelector} from "../../entities";

interface MessageStickerProps {
    stickerId: string,
    messageId: string,
    onImageLoaded?: () => void
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

let heightCache: {[messageId: string]: number} = {};
let stickersCache: {[stickerId: string]: string} = {};

window.addEventListener("resize", () => heightCache = {});

export const MessageSticker: FunctionComponent<MessageStickerProps> = observer(({
    stickerId,
    messageId,
    onImageLoaded
}) => {
    const {
        stickerPackDialog: {
            setStickerPackId
        }
    } = useStore();
    const classes = useStyles();
    const [loaded, setLoaded] = useState(false);
    const imageContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (loaded && !heightCache[messageId] && imageContainerRef && imageContainerRef.current) {
            heightCache[messageId] = imageContainerRef.current.getBoundingClientRect().height;

            if (onImageLoaded) {
                onImageLoaded();
            }
        }
    });

    const sticker = useEntityById("stickers", stickerId);
    const image = useEntitySelector("uploads", entities => entities.uploads.findImage(sticker.imageId));
    const targetSize = image.meta!.height >= 256 ? 256 : image.meta!.height;

    return (
        <ImageList cols={1}
                   style={{margin: "0px! important"}}
                   gap={0}
        >
            <ImageListItem cols={1}>
                <div className={classes.imageWrapper}
                     style={{
                         height: stickersCache[stickerId] && stickersCache[stickerId]
                     }}
                     ref={imageContainerRef}
                >
                    <img src={`${image.uri}?size=${targetSize}`}
                         className={classes.image}
                         onClick={() => setStickerPackId(sticker.stickerPackId)}
                         onLoad={() => setLoaded(true)}
                    />
                </div>
            </ImageListItem>
        </ImageList>
    );
});
