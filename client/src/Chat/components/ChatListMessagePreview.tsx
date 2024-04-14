import React, {Fragment, FunctionComponent, ReactElement, ReactNode} from "react";
import {observer} from "mobx-react";
import {Audiotrack, FileCopy, Image, KeyboardVoice, VideoLibrary} from "@mui/icons-material";
import {Emoji} from "emoji-mart";
import {useEntities, useLocalization, useStore} from "../../store";
import {Upload, UploadType} from "../../api/types/response";
import {capitalize} from "../../utils/string-utils";
import {Labels, TranslationFunction} from "../../localization";
import {StickerEntity} from "../../Sticker";
import {MessageEntity} from "../../Message/types";
import {MarkdownTextWithEmoji} from "../../Markdown";
import {ExtendedEmojiSet} from "../../Emoji/types";

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
        emoji: {
            selectedEmojiSet
        }
    } = useStore();
    const {
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
    } = useEntities()
    const {l} = useLocalization();

    const message = findMessage(messageId);
    const messageSender = findUser(message.sender);
    const messageUploads = findUploads(message.uploads);
    const messageSticker = message.stickerId && findSticker(message.stickerId);

    if (message.deleted) {
        return <i>{l("message.deleted")}</i>;
    }

    const messageSenderName = messageSender.firstName;

    if (messageSticker) {
        return renderSticker(messageSenderName, messageSticker, selectedEmojiSet, l);
    }

    if (message.text && message.text.length !== 0) {
        return renderText(messageSenderName, message);
    }

    if (messageUploads.length !== 0) {
        if (messageUploads.length === 1) {
            return renderMessageWithSingleUpload(messageSenderName, messageUploads[0], l);
        } else {
            return renderMessageWithMultipleUploads(messageSenderName, message, l);
        }
    }

    return (
        <Fragment>
            Unsupported chat type
        </Fragment>
    );
});

const renderSticker = (
    senderName: string,
    sticker: StickerEntity,
    emojiSet: ExtendedEmojiSet,
    l: TranslationFunction
): ReactElement => (
    <Fragment>
        {senderName}
        {": "}
        {sticker.emojis.length !== 0 && (
            <Emoji size={20}
                   emoji={sticker.emojis[0].id!}
                   set={emojiSet === "native" ? undefined : emojiSet}
                   native={emojiSet === "native"}
            />
        )}
        {` [${l("sticker")}]`}
    </Fragment>
);

const renderText = (senderName: string, message: MessageEntity): ReactElement =>  (
    <Fragment>
        {senderName}
        {": "}
        <MarkdownTextWithEmoji text={message.text}
                               emojiData={message.emoji}
                               renderParagraphsAsSpan
                               renderHeadersAsPlainText
                               renderQuotesAsPlainText
                               renderLinksAsPlainText
                               renderCodeAsPlainText
        />
    </Fragment>
);

const renderMessageWithSingleUpload = (senderName: string, upload: Upload<any>, l: TranslationFunction): ReactElement => {
    let uploadDisplay: ReactNode;

    switch (upload.type) {
        case UploadType.IMAGE:
        case UploadType.GIF:
            uploadDisplay = (
                <Fragment>
                    <Image fontSize="inherit"/>
                    {" "}
                    {capitalize(l("message.attachments.image"))}
                </Fragment>
            );
            break;
        case UploadType.VIDEO:
            uploadDisplay = (
                <Fragment>
                    <VideoLibrary fontSize="inherit"/>
                    {" "}
                    {capitalize(l("message.attachments.video"))}
                </Fragment>
            );
            break;
        case UploadType.AUDIO:
            uploadDisplay = (
                <Fragment>
                    <Audiotrack fontSize="inherit"/>
                    {" "}
                    {capitalize(l("message.attachments.audio"))}
                </Fragment>
            )
            break;
        case UploadType.VOICE_MESSAGE:
            uploadDisplay = (
                <Fragment>
                    <KeyboardVoice fontSize="inherit"/>
                    {" "}
                    {capitalize(l("message.attachments.voice-message"))}
                </Fragment>
            );
            break;
        case UploadType.FILE:
        default:
            uploadDisplay = (
                <Fragment>
                    <FileCopy fontSize="inherit"/>
                    {" "}
                    {capitalize(l("message.attachments.file"))}
                </Fragment>
            );
            break;
    }

    return (
        <Fragment>
            {senderName}
            {": "}
            {uploadDisplay}
        </Fragment>
    );
};

const renderMessageWithMultipleUploads = (senderName: string, message: MessageEntity, l: TranslationFunction): ReactElement => {
    const imagesText = message.imagesCount !== 0
        ? `${message.imagesCount} ${l(getSingularOrPluralLabel(message.imagesCount, "message.attachments.image"))}`
        : "";
    const videosText = message.videosCount !== 0
        ? `${message.videosCount} ${l(getSingularOrPluralLabel(message.videosCount, "message.attachments.video"))}`
        : "";
    const audiosText = message.audiosCount !== 0
        ? `${message.audiosCount} ${l(getSingularOrPluralLabel(message.audiosCount, "message.attachments.audio"))}`
        : "";
    const voiceMessagesText = message.voiceMessagesCount !== 0
        ? `${message.voiceMessagesCount} ${l(getSingularOrPluralLabel(message.voiceMessagesCount, "message.attachments.voice-message"))}`
        : "";
    const filesText = message.filesCount !== 0
        ? `${message.filesCount} ${l(getSingularOrPluralLabel(message.filesCount, "message.attachments.file"))}`
        : "";
    let attachmentsText = [imagesText, videosText, audiosText, voiceMessagesText, filesText]
        .filter(text => text !== "")
        .reduce((left, right) => `${left}, ${right}`)
    attachmentsText = `[${attachmentsText}]`;

    return  (
        <Fragment>
            {senderName}
            {": "}
            {attachmentsText}
        </Fragment>
    );
};

