import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {ImageList, ImageListItem, Theme, useMediaQuery} from "@mui/material";
import {createStyles, makeStyles} from "@mui/styles";
import {Sticker} from "./Sticker";
import {useEntityById} from "../../entities";
import {useStore} from "../../store";

interface StickersGridListProps {
    stickerPackId: string,
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
    stickerSize,
    onStickerClick
}) => {
    const {
        stickerPreviewDialog: {
            openDialog
        }
    } = useStore();
    const stickersPack = useEntityById("stickerPacks", stickerPackId);
    const classes = useStyles();
    const onSmallScreen = useMediaQuery((theme: Theme) => theme.breakpoints.down("md"));
    const stickers = stickersPack.stickersIds;

    const handleStickerClick = (stickerId: string): void => {
        if (onStickerClick) {
            onStickerClick(stickerId);
        }
    };

    return (
        <ImageList cols={4}
                   className={classes.imageList}
                   rowHeight={100}
        >
            {stickers.map(stickerId => (
                <ImageListItem cols={1}
                               key={stickerId}
                               style={{
                                   width: onSmallScreen ? 64 : 100
                               }}
                >
                    <Sticker stickerId={stickerId}
                             stickerType={stickersPack.stickersType}
                             size={stickerSize}
                             onClick={() => handleStickerClick(stickerId)}
                             onLongClick={() => openDialog(stickerId)}
                    />
                </ImageListItem>
            ))}
        </ImageList>
    );
});
