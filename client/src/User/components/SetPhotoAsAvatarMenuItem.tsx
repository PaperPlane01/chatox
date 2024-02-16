import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {ListItemIcon, ListItemText, MenuItem} from "@mui/material";
import {AccountCircle} from "@mui/icons-material";
import {useLocalization, useStore} from "../../store";

interface SetPhotoAsAvatarMenuItemProps {
    photoId: string,
    onClick?: () => void
}

export const SetPhotoAsAvatarMenuItem: FunctionComponent<SetPhotoAsAvatarMenuItemProps> = observer(({
    photoId,
    onClick
}) => {
    const {
        setPhotoAsAvatar: {
            setPhotoId,
            setPhotoAsAvatar
        }
    } = useStore();
    const {l} = useLocalization();

    const handleClick = (): void => {
        if (onClick) {
            onClick();
        }

        setPhotoId(photoId);
        setPhotoAsAvatar();
    };

    return (
        <MenuItem onClick={handleClick}>
            <ListItemIcon>
                <AccountCircle/>
            </ListItemIcon>
            <ListItemText>
                {l("photo.set-as-avatar")}
            </ListItemText>
        </MenuItem>
    );
});
