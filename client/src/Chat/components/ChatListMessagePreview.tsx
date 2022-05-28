import React, {Fragment, FunctionComponent, ReactNode} from "react";
import {observer} from "mobx-react";
import {Image, VideoLibrary, FileCopy, Audiotrack} from "@mui/icons-material";
import {useStore, useLocalization} from "../../store";
import {useEmojiParser} from "../../Emoji";
import {UploadType} from "../../api/types/response";
import {upperCaseFirstLetter} from "../../utils/string-utils";
import {Labels} from "../../localization";

interface ChatListMessagePreviewProps {
    messageId: string
}

const getSingularOrPluralLabel = (count: number, singularLabel: keyof Labels): keyof Labels => {
    if (count > 1) {
        return `${singularLabel}.plural` as keyof Labels;
    } else {
        return singularLabel;
    }
};

export const ChatListMessagePreview: FunctionComponent<ChatListMessagePreviewProps> = observer(({
    messageId
}) => {
    const {
        entities: {
            messages: {
                findById: findMessage
            },
            users: {
                findById: findUser
            },
            uploads: {
                findAllById: findUploads,
            },
            stickers: {
                findById: findSticker
            }
        }
    } = useStore();
    const {l} = useLocalization();
    const {parseEmoji} = useEmojiParser();

    const message = findMessage(messageId);
    const messageSender = findUser(message.sender);
    const messageUploads = findUploads(message.uploads);
    const messageSticker = message.stickerId && findSticker(message.stickerId);

    if (message.deleted) {
        return <i>{l("message.deleted")}</i>
    }

    const messageSenderName = messageSender.firstName;

    if (messageSticker) {
        return (
            <Fragment>
                {messageSenderName}
                {": "}
                {messageSticker.emojis.length !== 0 && parseEmoji((messageSticker.emojis[0] as any).native)}
                {` [${l("sticker")}]`}
            </Fragment>
        );
    }

    if (message.text && message.text.length !== 0) {
        return (
            <Fragment>
                {messageSenderName}
                {": "}
                {parseEmoji(message.text, message.emoji)}
            </Fragment>
        );
    }

    if (messageUploads.length !== 0) {
        if (messageUploads.length === 1) {
            const upload = messageUploads[0];
            let uploadDisplay: ReactNode;

            switch (upload.type) {
                case UploadType.IMAGE:
                case UploadType.GIF:
                    uploadDisplay = (
                        <Fragment>
                            <Image fontSize="inherit"/>
                            {" "}
                            {upperCaseFirstLetter(l("message.attachments.image"))}
                        </Fragment>
                    );
                    break;
                case UploadType.FILE:
                default:
                    uploadDisplay = (
                        <Fragment>
                            <FileCopy fontSize="inherit"/>
                            {" "}
                            {upperCaseFirstLetter(l("message.attachments.file"))}
                        </Fragment>
                    );
                    break;
                case UploadType.VIDEO:
                    uploadDisplay = (
                        <Fragment>
                            <VideoLibrary fontSize="inherit"/>
                            {" "}
                            {upperCaseFirstLetter(l("message.attachments.video"))}
                        </Fragment>
                    );
                    break;
                case UploadType.AUDIO:
                    uploadDisplay = (
                        <Fragment>
                            <Audiotrack fontSize="inherit"/>
                            {" "}
                            {upperCaseFirstLetter(l("message.attachments.audio"))}
                        </Fragment>
                    )
            }

            return (
                <Fragment>
                    {messageSenderName}
                    {": "}
                    {uploadDisplay}
                </Fragment>
            );
        } else {
            const imagesText = message.imagesCount !== 0
                ? `${message.imagesCount} ${l(getSingularOrPluralLabel(message.imagesCount, "message.attachments.image"))}`
                : "";
            const videosText = message.videosCount !== 0
                ? `${message.videosCount} ${l(getSingularOrPluralLabel(message.videosCount, "message.attachments.video"))}`
                : "";
            const audiosText = message.audiosCount !== 0
                ? `${message.audiosCount} ${l(getSingularOrPluralLabel(message.audiosCount, "message.attachments.audio"))}`
                : "";
            const filesText = message.filesCount !== 0
                ? `${message.filesCount} ${l(getSingularOrPluralLabel(message.filesCount, "message.attachments.file"))}`
                : "";
            let attachmentsText = [imagesText, videosText, audiosText, filesText]
                .filter(text => text !== "")
                .reduce((left, right) => `${left}, ${right}`)
            attachmentsText = `[${attachmentsText}]`;

            return  (
                <Fragment>
                    {messageSenderName}
                    {": "}
                    {attachmentsText}
                </Fragment>
            );
        }
    }

    return (
        <Fragment>
            Unsupported chat type
        </Fragment>
    );
});
