import React, {FunctionComponent} from "react";
import {ImageUpload} from "./ImageUpload";
import {Labels} from "../../localization";
import {ApiError} from "../../api";
import {UploadedFileContainer} from "../../utils/file-utils";
import {ImageUploadMetadata} from "../../api/types/response";
import {useLocalization} from "../../store";

interface AvatarUploadProps {
    onFileAttached: (file: File) => void,
    pending: boolean,
    validationError?: keyof Labels,
    submissionError?: ApiError,
    imageContainer?: UploadedFileContainer<ImageUploadMetadata>,
    defaultAvatarId?: string,
    defaultAvatarLabel: string,
    avatarColor: string,
    externalAvatarUri?: string,
    width?: string | number,
    height?: string | number
}

export const AvatarUpload: FunctionComponent<AvatarUploadProps> = ({
    onFileAttached,
    pending,
    validationError,
    submissionError,
    imageContainer,
    defaultAvatarLabel,
    defaultAvatarId,
    avatarColor,
    externalAvatarUri,
    width,
    height
}) => {
    const {l} = useLocalization();
    const avatarUri = imageContainer
        ? imageContainer.url
        : externalAvatarUri ? externalAvatarUri : undefined;

    return (
        <ImageUpload onFileAttached={onFileAttached}
                     pending={pending}
                     avatarProps={{
                         width: width ? width : 80,
                         height: height ? height : 80,
                         shape: "rounded",
                         avatarId: defaultAvatarId,
                         avatarUri: avatarUri,
                         avatarLetter: defaultAvatarLabel,
                         avatarColor: avatarColor
                     }}
                     uploadButtonLabel={l("chat.avatar.upload")}
                     validationError={validationError && l(validationError)}
                     imageContainer={imageContainer}
        />
    );
};
