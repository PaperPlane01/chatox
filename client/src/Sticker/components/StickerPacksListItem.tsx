import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {createStyles, makeStyles, ListItem, ListItemAvatar, ListItemText} from "@material-ui/core";
import {useStore} from "../../store";
import {Avatar} from "../../Avatar";

interface StickerPacksListItemProps {
    stickerPackId: string,
    onClick?: () => void
}

const useStyles = makeStyles(() => createStyles({
    stickerPacksListItem: {
        cursor: "pointer"
    }
}));

export const StickerPacksListItem: FunctionComponent<StickerPacksListItemProps> = observer(({
    stickerPackId,
    onClick
}) => {
    const {
        entities: {
            stickerPacks: {
                findById: findStickerPack
            },
            uploads: {
                findById: findUpload
            }
        }
    } = useStore();
    const classes = useStyles();

    const stickerPack = findStickerPack(stickerPackId);
    const stickerPackPreview = findUpload(stickerPack.previewId);

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
                <Avatar avatarLetter=""
                        avatarColor=""
                        shape="square"
                        avatarUri={`${stickerPackPreview.uri}?size=256`}
                />
            </ListItemAvatar>
            <ListItemText primary={stickerPack.name}
                          secondary={stickerPack.author ? stickerPack.author : null}
            />
        </ListItem>
    );
});
