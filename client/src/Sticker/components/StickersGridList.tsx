import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {GridList, GridListTile} from "@material-ui/core";
import {Sticker} from "./Sticker";
import {useStore} from "../../store";

interface StickersGridListProps {
    stickerPackId: string
}

export const StickersGridList: FunctionComponent<StickersGridListProps> = observer(({
    stickerPackId
}) => {
    const {
        entities: {
            stickerPacks: {
                findById: findStickerPack
            }
        }
    } = useStore();

    const stickers = findStickerPack(stickerPackId).stickersIds;

    return (
        <GridList cols={5}>
            {stickers.map(stickerId => (
                <GridListTile cols={1}
                              key={stickerId}
                >
                    <Sticker stickerId={stickerId}/>
                </GridListTile>
            ))}
        </GridList>
    );
});
