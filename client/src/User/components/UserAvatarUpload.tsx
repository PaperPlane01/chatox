import React, {FunctionComponent} from "react";
import {inject, observer} from "mobx-react";
import {createStyles, makeStyles} from "@material-ui/core";
import randomColor from "randomcolor";
import {AvatarUpload} from "../../Upload";
import {CurrentUser, ImageUploadMetadata} from "../../api/types/response";
import {Labels} from "../../localization";
import {ApiError} from "../../api";
import {UploadedFileContainer} from "../../utils/file-utils";
import {getUserAvatarLabel} from "../utils/get-user-avatar-label";
import {MapMobxToProps} from "../../store";

interface UserAvatarUploadProps {
    uploadFile: (file: File) => void,
    pending: boolean,
    validationError?: keyof Labels,
    submissionError?: ApiError,
    avatarContainer?: UploadedFileContainer<ImageUploadMetadata>,
    currentUser?: CurrentUser
}

const useStyles = makeStyles(() => createStyles({
    centered: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column"
    }
}));

const _UserAvatarUpload: FunctionComponent<UserAvatarUploadProps> = ({
    uploadFile,
    validationError,
    submissionError,
    pending,
    avatarContainer,
    currentUser
}) => {
    const classes = useStyles();

    if (!currentUser) {
        return null;
    }

    return (
        <div className={classes.centered}>
            <AvatarUpload onFileAttached={uploadFile}
                          pending={pending}
                          imageContainer={avatarContainer}
                          defaultAvatarLabel={getUserAvatarLabel(currentUser)}
                          avatarColor={randomColor({seed: currentUser.id})}
                          validationError={validationError}
                          submissionError={submissionError}
                          defaultAvatarId={currentUser.avatarId}
            />
        </div>
    )
};

const mapMobxToProps: MapMobxToProps<UserAvatarUploadProps> = ({
    userAvatarUpload,
    authorization
}) => ({
    uploadFile: userAvatarUpload.uploadFile,
    validationError: userAvatarUpload.validationError,
    submissionError: userAvatarUpload.submissionError,
    pending: userAvatarUpload.pending,
    avatarContainer: userAvatarUpload.imageContainer,
    currentUser: authorization.currentUser
});

export const UserAvatarUpload = inject(mapMobxToProps)(observer(_UserAvatarUpload) as FunctionComponent);

