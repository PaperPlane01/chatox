import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {ImageList} from "@mui/material";
import {createStyles, makeStyles} from "@mui/styles";
import {CreateUserProfilePhotoButton} from "./CreateUserProfilePhotoButton";
import {useStore} from "../../store";
import {UserProfileGalleryPhoto} from "./UserProfileGalleryPhoto";

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
        }
    } = useStore();
    const classes = useStyles();

    return (
        <div className={classes.galleryContainer}>
            <CreateUserProfilePhotoButton/>
            <ImageList cols={3}>
                {uploads.map((upload, index) => (
                    <UserProfileGalleryPhoto uri={upload.uri}
                                             index={index}
                                             userProfilePhotoId={upload.profilePhotoId}
                                             key={upload.id}
                    />
                ))}
            </ImageList>
        </div>
    );
});