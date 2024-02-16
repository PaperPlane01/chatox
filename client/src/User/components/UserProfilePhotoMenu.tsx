import React, {Fragment, FunctionComponent, ReactNode} from "react";
import {observer} from "mobx-react";
import {IconButton, Menu} from "@mui/material";
import {MoreVert} from "@mui/icons-material";
import {bindMenu, bindToggle, usePopupState} from "material-ui-popup-state/hooks";
import {DeletePhotoMenuItem} from "./DeletePhotoMenuItem";
import {SetPhotoAsAvatarMenuItem} from "./SetPhotoAsAvatarMenuItem";
import {usePermissions, useStore} from "../../store";

export const UserProfilePhotoMenu: FunctionComponent = observer(() => {
    const {
        userProfile: {
            selectedUserId
        },
        userProfilePhotosGallery: {
            currentUserProfilePhotosIds,
            currentLightboxIndex
        }
    } = useStore();
    const {
        users: {
            canDeleteProfilePhoto,
            canUploadProfilePhoto
        }
    } = usePermissions();
    const photoMenuPopupState = usePopupState({
        variant: "popover",
        popupId: "photoMenu"
    });

    if (!selectedUserId) {
        return null;
    }

    const photoId = currentUserProfilePhotosIds[currentLightboxIndex];
    const menuItems: ReactNode[] = [];

    canUploadProfilePhoto(selectedUserId) && menuItems.push(
        <SetPhotoAsAvatarMenuItem photoId={photoId}
                                  onClick={photoMenuPopupState.close}
        />
    )
    canDeleteProfilePhoto(selectedUserId) && menuItems.push(
        <DeletePhotoMenuItem photoId={photoId}
                             onClick={photoMenuPopupState.close}
        />
    );

    if (menuItems.length === 0) {
        return null;
    }

    return (
        <Fragment>
            <IconButton className="yarl__button"
                        {...bindToggle(photoMenuPopupState)}
            >
                <MoreVert/>
            </IconButton>
            <Menu sx={{
                zIndex: 10000000000000
            }}
                  {...bindMenu(photoMenuPopupState)}>
                {menuItems}
            </Menu>
        </Fragment>
    );
});
