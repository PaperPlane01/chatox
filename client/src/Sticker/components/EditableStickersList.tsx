import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {ImageList, ImageListItem, useMediaQuery, useTheme} from "@mui/material";
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
    const onSmallScreen = useMediaQuery(theme.breakpoints.down('lg'));

    return (
        <ImageList cols={onSmallScreen ? 2 : 4}>
            {stickerContainers.map(stickerContainer => (
                <ImageListItem cols={1}>
                    <EditableSticker stickerContainer={stickerContainer}/>
                </ImageListItem>
            ))}
            <ImageListItem cols={1}>
                <AddStickerButton/>
            </ImageListItem>
        </ImageList>
    );
});

