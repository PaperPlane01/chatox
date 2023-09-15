import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Dialog, DialogTitle, DialogContent, IconButton, FormControlLabel, Switch} from "@mui/material";
import {ArrowBack, Close} from "@mui/icons-material";
import {createStyles, makeStyles} from "@mui/styles";
import {HttpStatusCode} from "axios";
import {useStore, useLocalization} from "../../store";
import {ImageUpload} from "../../Upload";
import {API_UNREACHABLE_STATUS, ApiError} from "../../api";
import {TranslationFunction} from "../../localization";
import {isDefined} from "../../utils/object-utils";
import {useMobileDialog} from "../../utils/hooks";
import {commonStyles} from "../../style";

const useStyles = makeStyles(() => createStyles({
    centered: commonStyles.centered
}));

const getUploadErrorText = (error: ApiError, l: TranslationFunction): string => {
    if (error.status === HttpStatusCode.Conflict) {
        if (error.metadata && error.metadata.errorCode === "PROFILE_PHOTOS_LIMIT_REACHED"
            && isDefined(error.metadata.additional.maxProfilePhotos)) {
            return l(
                "photo.upload.error.profile-photos-limit-reached",
                {maxProfilePhotos: error.metadata.additional.maxProfilePhotos}
            );
        }
    }

    if (error.status === API_UNREACHABLE_STATUS) {
        return l("common.error.server-unreachable");
    }

    return l("photo.upload.error.unknown", {errorStatus: error.status});
}

export const CreateUserProfilePhotoDialog: FunctionComponent = observer(() => {
    const {
        userProfilePhotoCreation: {
            uploadImage,
            pending,
            uploadValidationError,
            userProfilePhotoError,
            createUserProfilePhotoDialogOpen,
            setAsAvatar,
            setSetAsAvatar,
            setCreateUserProfilePhotoDialogOpen,
            imageUpload: {
                imageContainer
            }
        },
        userProfilePhotosGallery: {
            setGalleryOpen
        }
    } = useStore();
    const {l} = useLocalization();
    const {fullScreen} = useMobileDialog();
    const classes = useStyles();
    const url = imageContainer
        ? imageContainer.url
        : undefined;

    const handleBackClick = (): void => {
        setCreateUserProfilePhotoDialogOpen(false);
        setGalleryOpen(true);
    }

    return (
        <Dialog open={createUserProfilePhotoDialogOpen}
                fullWidth
                maxWidth="md"
                fullScreen={fullScreen}
                onClose={() => setCreateUserProfilePhotoDialogOpen(false)}
        >
            <DialogTitle>
                <IconButton onClick={handleBackClick}>
                    <ArrowBack/>
                </IconButton>
                {l("photo.upload")}
                <IconButton style={{float: "right"}}
                            onClick={() => setCreateUserProfilePhotoDialogOpen(false)}
                >
                    <Close/>
                </IconButton>
            </DialogTitle>
            <DialogContent>
                <FormControlLabel control={(
                    <Switch checked={setAsAvatar}
                            onChange={event => setSetAsAvatar(event.target.checked)}
                    />
                )}
                                  label={l("photo.upload.set-as-avatar")}
                />
                <div className={classes.centered}>
                    <ImageUpload onFileAttached={uploadImage}
                                 pending={pending}
                                 avatarProps={{
                                     width: 320,
                                     height: 320,
                                     shape: "rectangular",
                                     avatarUri: url
                                 }}
                                 uploadButtonLabel={l("photo.upload")}
                                 validationError={uploadValidationError}
                                 submissionError={userProfilePhotoError && getUploadErrorText(userProfilePhotoError, l)}
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
});
