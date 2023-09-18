import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {ImageList} from "@mui/material";
import {createStyles, makeStyles} from "@mui/styles";
import {CreateUserProfilePhotoButton} from "./CreateUserProfilePhotoButton";
import {UserProfileGalleryPhoto} from "./UserProfileGalleryPhoto";
import {usePermissions, useStore} from "../../store";

const useStyles = makeStyles(() => createStyles({
    galleryContainer: {
        display: "flex",
        flexDirection: "column"
    }
}));

export const UserPhotosGallery: FunctionComponent = observer(() => {
    const {
        userProfilePhotosGallery: {
            uploads
        },
        userProfile: {
            selectedUserId
        }
    } = useStore();
    const {
        users: {
            canUploadProfilePhoto
        }
    } = usePermissions();
    const classes = useStyles();

    if (!selectedUserId) {
        return null;
    }

    return (
        <div className={classes.galleryContainer}>
            {canUploadProfilePhoto(selectedUserId) && (
                <CreateUserProfilePhotoButton/>
            )}
            <ImageList cols={3}>
                {uploads.map((upload, index) => (
                    <UserProfileGalleryPhoto uri={upload.uri}
                                             index={index}
                                             userProfilePhotoId={upload.profilePhotoId}
                                             key={upload.id}
                                             userId={selectedUserId}
                    />
                ))}
            </ImageList>
        </div>
    );
});