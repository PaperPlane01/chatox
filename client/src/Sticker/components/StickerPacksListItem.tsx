import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {ListItem, ListItemAvatar, ListItemText} from "@mui/material";
import {makeStyles} from "tss-react/mui";
import {StickerPackMenu} from "./StickerPackMenu";
import {StickerPackPreview} from "./StickerPackPreview";
import {useEntityById} from "../../entities";
import {ImageUploadMetadata, StickerUploadMetadata, Upload} from "../../api/types/response";

interface StickerPacksListItemProps {
    stickerPackId: string,
    onClick?: () => void
}

const useStyles = makeStyles()(() => ({
    stickerPacksListItem: {
        cursor: "pointer"
    }
}));

export const StickerPacksListItem: FunctionComponent<StickerPacksListItemProps> = observer(({
    stickerPackId,
    onClick
}) => {
    const {classes} = useStyles();

    const stickerPack = useEntityById("stickerPacks", stickerPackId);
    const stickerPackPreview = useEntityById("uploads", stickerPack.previewId) as Upload<StickerUploadMetadata | ImageUploadMetadata>;

    const handleClick = (): void => {
        if (onClick) {
            onClick();
        }
    };

    return (
        <ListItem onClick={handleClick}
                  className={classes.stickerPacksListItem}
        >
            <ListItemAvatar>
                <StickerPackPreview stickersType={stickerPack.stickersType}
                                    upload={stickerPackPreview}
                                    width={40}
                                    height={40}
                />
            </ListItemAvatar>
            <ListItemText primary={stickerPack.name}
                          secondary={stickerPack.author ? stickerPack.author : null}
            />
            <StickerPackMenu stickerPackId={stickerPackId}/>
        </ListItem>
    );
});
