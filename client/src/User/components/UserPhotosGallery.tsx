import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {ImageList, ImageListItem} from "@mui/material";
import {createStyles, makeStyles} from "@mui/styles";
import {CreateUserProfilePhotoButton} from "./CreateUserProfilePhotoButton";
import {useStore} from "../../store";

const useStyles = makeStyles(() => createStyles({
    galleryContainer: {
        display: "flex",
        flexDirection: "column"
    }
}));

export const UserPhotosGallery: FunctionComponent = observer(() => {
    const {
        userProfilePhotosGallery: {
            openLightboxToIndex,
            uploads
        }
    } = useStore();
    const classes = useStyles();

    return (
        <div className={classes.galleryContainer}>
            <CreateUserProfilePhotoButton/>
            <ImageList cols={3}>
                {uploads.map((upload, index) => (
                    <ImageListItem key={upload.id}
                                   onClick={() => openLightboxToIndex(index)}
                    >
                        <img src={`${upload.uri}?size=256`}/>
                    </ImageListItem>
                ))}
            </ImageList>
        </div>
    );
});