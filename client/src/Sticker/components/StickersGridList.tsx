import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {ImageList, ImageListItem} from "@mui/material";
import {Sticker} from "./Sticker";
import {useEntityById} from "../../entities";

interface StickersGridListProps {
    stickerPackId: string,
    gridListTileWidth?: number,
    gridListTileHeight?: number
    onStickerClick?: (stickerId: string) => void
}

export const StickersGridList: FunctionComponent<StickersGridListProps> = observer(({
    stickerPackId,
    gridListTileHeight,
    gridListTileWidth,
    onStickerClick
}) => {
    const stickersPack = useEntityById("stickerPacks", stickerPackId);
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
        <ImageList cols={5}>
            {stickers.map(stickerId => (
                <ImageListItem cols={1}
                              key={stickerId}
                              style={gridListTileStyle}
                >
                    <Sticker stickerId={stickerId}
                             onClick={() => handleStickerClick(stickerId)}
                    />
                </ImageListItem>
            ))}
        </ImageList>
    );
});
