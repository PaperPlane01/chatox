import React, {FunctionComponent} from "react";
import {inject, observer} from "mobx-react";
import {createStyles, makeStyles} from "@material-ui/core";
import randomColor from "randomcolor";
import {AvatarUpload} from "../../Upload";
import {ChatOfCurrentUserEntity} from "../types";
import {Labels} from "../../localization/types";
import {ApiError} from "../../api";
import {UploadedFileContainer} from "../../utils/file-utils";
import {ImageUploadMetadata} from "../../api/types/response";
import {getAvatarLabel} from "../utils";
import {MapMobxToProps} from "../../store";

interface ChatAvatarUploadProps {
    uploadFile: (file: File) => void,
    pending: boolean,
    validationError?: keyof Labels,
    submissionError?: ApiError,
    avatarContainer?: UploadedFileContainer<ImageUploadMetadata>
    selectedChatId?: string,
    findChat: (id: string) => ChatOfCurrentUserEntity
}

const useStyles = makeStyles(() => createStyles({
    centered: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column"
    }
}));

const _ChatAvatarUpload: FunctionComponent<ChatAvatarUploadProps> = ({
    uploadFile,
    validationError,
    submissionError,
    pending,
    avatarContainer,
    selectedChatId,
    findChat,
}) => {
    const classes = useStyles();

    if (!selectedChatId) {
        return null;
    }

    const chat = findChat(selectedChatId);

    return (
        <div className={classes.centered}>
            <AvatarUpload onFileAttached={uploadFile}
                          pending={pending}
                          imageContainer={avatarContainer}
                          defaultAvatarLabel={getAvatarLabel(chat.name)}
                          avatarColor={randomColor({seed: chat.id})}
                          validationError={validationError}
                          submissionError={submissionError}
                          defaultAvatarId={chat.avatarId}
            />
        </div>
    )
};

const mapMobxToProps: MapMobxToProps<ChatAvatarUploadProps> = ({chatAvatarUpload, chat, entities}) => ({
    uploadFile: chatAvatarUpload.uploadFile,
    validationError: chatAvatarUpload.validationError,
    submissionError: chatAvatarUpload.submissionError,
    pending: chatAvatarUpload.pending,
    avatarContainer: chatAvatarUpload.imageContainer,
    selectedChatId: chat.selectedChatId,
    findChat: entities.chats.findById
});

export const ChatAvatarUpload = inject(mapMobxToProps)(observer(_ChatAvatarUpload) as FunctionComponent);
