import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {ListItemIcon, ListItemText, MenuItem} from "@mui/material";
import {Image} from "@mui/icons-material";
import {useLocalization, useStore} from "../../store";

interface OpenUserPhotosMenuItemProps {
    onClick?: () => void
}

export const OpenUserPhotosMenuItem: FunctionComponent<OpenUserPhotosMenuItemProps> = observer(({
    onClick
}) => {
    const {
        userProfilePhotosGallery: {
            setGalleryOpen
        }
    } = useStore();
    const {l} = useLocalization();

    const handleClick = (): void => {
        if (onClick) {
            onClick();
        }

        setGalleryOpen(true);
    };

    return (
        <MenuItem onClick={handleClick}>
            <ListItemIcon>
                <Image/>
            </ListItemIcon>
            <ListItemText>
                {l("common.photos")}
            </ListItemText>
        </MenuItem>
    );
});
