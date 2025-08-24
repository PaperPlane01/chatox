import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {ImageList, ImageListItem, useMediaQuery, useTheme} from "@mui/material";
import {EditableSticker} from "./EditableSticker";
import {AddStickerButton} from "./AddStickerButton";
import {StickerContainer} from "../stores";
import {StickerPackFormContext} from "../types";

interface EditableStickersListProps {
    stickerContainers: StickerContainer[],
    context: StickerPackFormContext,
    hideAddStickerButton?: boolean
}

export const EditableStickersList: FunctionComponent<EditableStickersListProps> = observer(({
    stickerContainers,
    context,
    hideAddStickerButton = false
}) => {
    const theme = useTheme();
    const onSmallScreen = useMediaQuery(theme.breakpoints.down("lg"));

    return (
        <ImageList cols={onSmallScreen ? 2 : 6}>
            {stickerContainers.map((stickerContainer, index) => (
                <ImageListItem cols={1}
                               key={stickerContainer.id}
                >
                    <EditableSticker stickerContainer={stickerContainer}
                                     index={index}
                                     stickersCount={stickerContainers.length}
                                     context={context}
                    />
                </ImageListItem>
            ))}
            {!hideAddStickerButton && (
                <ImageListItem cols={1}>
                    <AddStickerButton context={context}/>
                </ImageListItem>
            )}
        </ImageList>
    );
});
