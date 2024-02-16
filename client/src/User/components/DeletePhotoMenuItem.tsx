import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {ListItemIcon, ListItemText, MenuItem} from "@mui/material";
import {useLocalization, useStore} from "../../store";
import {Delete} from "@mui/icons-material";

interface DeletePhotoMenuItemProps {
    photoId: string,
    onClick?: () => void
}

export const DeletePhotoMenuItem: FunctionComponent<DeletePhotoMenuItemProps> = observer(({
    photoId,
    onClick
}) => {
    const {
        deleteUserPhoto: {
            setPhotoId,
            deleteUserProfilePhoto
        }
    } = useStore();
    const {l} = useLocalization();

    const handleClick = (): void => {
        if (onClick) {
            onClick();
        }

        setPhotoId(photoId);
        deleteUserProfilePhoto();
    };

    return (
        <MenuItem onClick={handleClick}>
            <ListItemIcon>
                <Delete/>
            </ListItemIcon>
            <ListItemText>
                {l("common.delete")}
            </ListItemText>
        </MenuItem>
    );
});
