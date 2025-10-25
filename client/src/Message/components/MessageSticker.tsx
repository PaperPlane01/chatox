import React, {FunctionComponent, useEffect, useRef, useState} from "react";
import {observer} from "mobx-react";
import {ImageList, ImageListItem} from "@mui/material";
import {createStyles, makeStyles} from "@mui/styles";
import {Sticker} from "../../Sticker";
import {useStore} from "../../store";
import {useEntityById} from "../../entities";
import {UploadType, isLottieSticker} from "../../api/types/response";

interface MessageStickerProps {
    stickerId: string,
    messageId: string,
    onImageLoaded?: () => void
}

const useStyles = makeStyles(() => createStyles({
    stickerWrapper: {
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
    const isLottie = isLottieSticker(sticker.stickerType);
    const height = isLottie ? 256 : (heightCache[messageId] ?? undefined);
    const width = isLottie ? 256 : undefined;

    return (
        <ImageList cols={1}
                   style={{margin: "0px! important"}}
                   gap={0}
        >
            <ImageListItem cols={1}>
                <div className={classes.stickerWrapper}
                     style={{
                         height,
                         width,
                         maxHeight: 256
                }}
                     ref={imageContainerRef}
                >
                    <Sticker stickerType={sticker.stickerType}
                             stickerId={stickerId}
                             onClick={() => setStickerPackId(sticker.stickerPackId)}
                             onLoad={() => setLoaded(true)}
                    />
                </div>
            </ImageListItem>
        </ImageList>
    );
});
