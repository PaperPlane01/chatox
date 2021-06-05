import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {GridList, GridListTile, useMediaQuery, useTheme} from "@material-ui/core";
import {EditableSticker} from "./EditableSticker";
import {AddStickerButton} from "./AddStickerButton";
import {StickerContainer} from "../stores";

interface EditableStickersListProps {
    stickerContainers: StickerContainer[]
}

export const EditableStickersList: FunctionComponent<EditableStickersListProps> = observer(({
    stickerContainers
}) => {
    const theme = useTheme();
    const onSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

    return (
        <GridList cols={onSmallScreen ? 2 : 4}>
            {stickerContainers.map(stickerContainer => (
                <GridListTile cols={1}>
                    <EditableSticker stickerContainer={stickerContainer}/>
                </GridListTile>
            ))}
            <GridListTile cols={1}>
                <AddStickerButton/>
            </GridListTile>
        </GridList>
    );
});

