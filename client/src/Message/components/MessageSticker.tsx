import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {createStyles, GridList, GridListTile} from "@material-ui/core";
import {MessageImagesSimplifiedGrid} from "./MessageImagesSimplifiedGrid";
import {useStore} from "../../store";
import {makeStyles} from "@material-ui/core/styles";

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
        <GridList cols={1}
                  style={{margin: "0px! important"}}
                  spacing={0}
        >
            <GridListTile cols={1}>
                <div className={classes.imageWrapper}>
                    <img src={`${image.uri}?size=${targetSize}`}
                         className={classes.image}
                         onClick={() => setStickerPackId(sticker.stickerPackId)}
                    />
                </div>
            </GridListTile>
        </GridList>
    );
});
