import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {ImageList, ImageListItem, Theme} from "@mui/material";
import {createStyles, makeStyles} from "@mui/styles";
import {Sticker} from "./Sticker";
import {useEntityById} from "../../entities";

interface StickersGridListProps {
    stickerPackId: string,
    gridListTileWidth?: number,
    gridListTileHeight?: number,
    stickerSize?: number,
    onStickerClick?: (stickerId: string) => void
}

const useStyles = makeStyles((theme: Theme) => createStyles({
    imageList: {
        overflow: "hidden",
        paddingLeft: theme.spacing(1),
        paddingRight: theme.spacing(1)
    }
}));

export const StickersGridList: FunctionComponent<StickersGridListProps> = observer(({
    stickerPackId,
    gridListTileHeight,
    gridListTileWidth,
    stickerSize,
    onStickerClick
}) => {
    const stickersPack = useEntityById("stickerPacks", stickerPackId);
    const classes = useStyles();
    const stickers = stickersPack.stickersIds;
    const gridListTileStyle = gridListTileWidth && gridListTileHeight
        ? {width: gridListTileWidth, height: gridListTileHeight}
        : undefined;

    const handleStickerClick = (stickerId: string): void => {
        if (onStickerClick) {
            onStickerClick(stickerId);
        }
    };

    return (
        <ImageList cols={5}
                   className={classes.imageList}
        >
            {stickers.map(stickerId => (
                <ImageListItem cols={1}
                              key={stickerId}
                              style={gridListTileStyle}
                >
                    <Sticker stickerId={stickerId}
                             size={stickerSize}
                             onClick={() => handleStickerClick(stickerId)}
                    />
                </ImageListItem>
            ))}
        </ImageList>
    );
});
