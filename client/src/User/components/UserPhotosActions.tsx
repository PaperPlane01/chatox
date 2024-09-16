import React, {Fragment, FunctionComponent} from "react";
import {observer} from "mobx-react";
import {IconButton, useMediaQuery, useTheme} from "@mui/material";
import {Close} from "@mui/icons-material";
import {DeleteSelectedUserPhotosButton} from "./DeleteSelectedUserPhotosButton";
import {SetSelectedPhotoAsAvatarButton} from "./SetSelectedPhotoAsAvatarButton";
import {useLocalization, usePermissions, useStore} from "../../store";
import {useEntityById} from "../../entities";
import {TranslationFunction} from "../../localization";

interface SelectedUserPhotosActionsProps {
    onClose: () => void
}

const getLabel = (selectedPhotosCount: number, username: string, l: TranslationFunction): string => {
    if (selectedPhotosCount === 0) {
        return l("user.photo.list", {username});
    } else if (selectedPhotosCount === 1) {
        return l("photo.selection.count.singular", {selectedPhotosCount});
    } else {
        return l("photo.selection.count", {selectedPhotosCount});
    }
}

export const UserPhotosActions: FunctionComponent<SelectedUserPhotosActionsProps> = observer(({
    onClose
}) => {
    const {
        selectedUserPhotos: {
            selectedPhotosCount
        },
        userProfile: {
            selectedUserId
        }
    } = useStore();
    const {l} = useLocalization();
    const {
        users: {
            canUploadProfilePhoto,
            canDeleteProfilePhoto
        }
    } = usePermissions();
    const theme = useTheme();
    const onSmallScreen = useMediaQuery(theme.breakpoints.down("md"));

    const user = useEntityById("users", selectedUserId);

    if (!user || !selectedUserId) {
        return null;
    }

    const label = getLabel(selectedPhotosCount, user.firstName, l);

    const displaySetAsAvatarButton = canUploadProfilePhoto(selectedUserId) && selectedPhotosCount === 1;
    const displayDeleteButton = canDeleteProfilePhoto(selectedUserId) && selectedPhotosCount !== 0;

    return (
        <Fragment>
            {onSmallScreen && selectedPhotosCount !== 0
                ? (
                    <Fragment>
                        {displayDeleteButton && <DeleteSelectedUserPhotosButton showCount/>}
                        {displaySetAsAvatarButton && <SetSelectedPhotoAsAvatarButton/>}
                    </Fragment>
                )
                : label
            }
            <div style={{
                float: "right",
                display: "flex",
                gap: 8
            }}>
                {displayDeleteButton && !onSmallScreen && <DeleteSelectedUserPhotosButton/>}
                {displaySetAsAvatarButton && !onSmallScreen && <SetSelectedPhotoAsAvatarButton/>}
                <IconButton onClick={onClose}>
                    <Close/>
                </IconButton>
            </div>
        </Fragment>
    );
});
