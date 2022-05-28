import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {ImageList, ImageListItem} from "@mui/material";
import {createStyles, makeStyles} from "@mui/styles";
import {useStore} from "../../store";

interface MessageStickerProps {
    stickerId: string,
    messageId: string
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

export const MessageSticker: FunctionComponent<MessageStickerProps> = observer(({
    stickerId
}) => {
    const {
        entities: {
            stickers: {
                findById: findSticker
            },
            uploads: {
                findImage
            }
        },
        stickerPackDialog: {
            setStickerPackId
        }
    } = useStore();
    const classes = useStyles();

    const sticker = findSticker(stickerId);
    const image = findImage(sticker.imageId);
    const targetSize = image.meta!.height >= 256 ? 256 : image.meta!.height;

    return (
        <ImageList cols={1}
                   style={{margin: "0px! important"}}
                   gap={0}
        >
            <ImageListItem cols={1}>
                <div className={classes.imageWrapper}>
                    <img src={`${image.uri}?size=${targetSize}`}
                         className={classes.image}
                         onClick={() => setStickerPackId(sticker.stickerPackId)}
                    />
                </div>
            </ImageListItem>
        </ImageList>
    );
});
