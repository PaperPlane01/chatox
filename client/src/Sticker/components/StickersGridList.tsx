import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {GridList, GridListTile} from "@material-ui/core";
import {Sticker} from "./Sticker";
import {useStore} from "../../store";

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
    const {
        entities: {
            stickerPacks: {
                findById: findStickerPack
            }
        }
    } = useStore();

    const stickers = findStickerPack(stickerPackId).stickersIds;
    const gridListTileStyle = gridListTileWidth && gridListTileHeight
        ? {width: gridListTileWidth, height: gridListTileHeight}
        : undefined;

    const handleStickerClick = (stickerId: string): void => {
        if (onStickerClick) {
            onStickerClick(stickerId);
        }
    };

    return (
        <GridList cols={5}>
            {stickers.map(stickerId => (
                <GridListTile cols={1}
                              key={stickerId}
                              style={gridListTileStyle}
                >
                    <Sticker stickerId={stickerId}
                             onClick={() => handleStickerClick(stickerId)}
                    />
                </GridListTile>
            ))}
        </GridList>
    );
});
