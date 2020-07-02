import React, {FunctionComponent, useState} from "react";
import {inject, observer} from "mobx-react";
import {Button, CircularProgress, Typography, createStyles, makeStyles} from "@material-ui/core";
import {Image} from "@material-ui/icons";
import randomColor from "randomcolor";
import {Avatar} from "../../Avatar";
import {ChatOfCurrentUserEntity} from "../types";
import {Labels} from "../../localization/types";
import {Localized, localized} from "../../localization";
import {ApiError} from "../../api";
import {UploadedFileContainer} from "../../utils/file-utils";
import {ImageUploadMetadata} from "../../api/types/response";
import {getAvatarLabel} from "../utils";
import {MapMobxToProps} from "../../store";

interface ChatAvatarUploadMobxProps {
    uploadFile: (file: File) => void,
    pending: boolean,
    validationError?: keyof Labels,
    submissionError?: ApiError,
    avatarContainer?: UploadedFileContainer<ImageUploadMetadata>
    selectedChatId?: string,
    findChat: (id: string) => ChatOfCurrentUserEntity
}

type ChatAvatarUploadProps = ChatAvatarUploadMobxProps & Localized;

const useStyles = makeStyles(() => createStyles({
    centered: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100%"
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
    l
}) => {
    const [value, setValue] = useState("");
    const classes = useStyles();

    if (!selectedChatId) {
        return null;
    }

    const chat = findChat(selectedChatId);

    return (
        <div className={classes.centered}>
            <Avatar avatarLetter={getAvatarLabel(chat.name)}
                    avatarColor={randomColor({seed: chat.id})}
                    avatarId={chat.avatarId}
                    avatarUri={avatarContainer && avatarContainer.url}
                    width={80}
                    height={80}
            />
            <Button variant="outlined"
                    color="primary"
                    disabled={pending}
                    component="label"
            >
                {pending && <CircularProgress color="primary" size={25}/>}
                {!pending && <Image/>}
                {l("chat.avatar.upload")}
                <input type="file"
                       value={value}
                       style={{display: "none"}}
                       accept="image/png, image/jpg, image/jpeg"
                       onClick={() => setValue('')}
                       onChange={event => {
                           if (event.target.files && event.target.files.length !== 0) {
                               uploadFile(event.target.files[0]);
                           }
                       }}
                />
            </Button>
            {validationError && (
                <Typography variant="body1"
                            style={{color: "red"}}
                >
                    {l(validationError)}
                </Typography>
            )}
        </div>
    )
};

const mapMobxToProps: MapMobxToProps<ChatAvatarUploadMobxProps> = ({chatAvatarUpload, chat, entities}) => ({
    uploadFile: chatAvatarUpload.uploadFile,
    validationError: chatAvatarUpload.validationError,
    submissionError: chatAvatarUpload.submissionError,
    pending: chatAvatarUpload.pending,
    avatarContainer: chatAvatarUpload.avatarContainer,
    selectedChatId: chat.selectedChatId,
    findChat: entities.chats.findById
});

export const ChatAvatarUpload = localized(
    inject(mapMobxToProps)(observer(_ChatAvatarUpload))
) as FunctionComponent;
