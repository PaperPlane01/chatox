import React, {Fragment, FunctionComponent, ReactElement, ReactNode} from "react";
import {observer} from "mobx-react";
import {Theme} from "@mui/material";
import {Audiotrack, FileCopy, Image, KeyboardVoice, VideoLibrary} from "@mui/icons-material";
import {makeStyles} from "tss-react/mui";
import {EmojiData} from "emoji-mart";
import {useLocalization, useStore} from "../../store";
import {useEntitiesByIds, useEntityById} from "../../entities";
import {Upload, UploadType} from "../../api/types/response";
import {capitalize} from "../../utils/string-utils";
import {Labels, TranslationFunction} from "../../localization";
import {StickerEntity} from "../../Sticker";
import {MessageEntity} from "../../Message/types";
import {MarkdownTextWithEmoji} from "../../Markdown";
import {EmojiSet} from "../../Emoji/types";

interface ChatListMessagePreviewProps {
    messageId: string,
    draftMessageId?: string,
    hideDraftMessage?: boolean
}

const useStyles = makeStyles()((theme: Theme) => ({
    draftMessage: {
        color: theme.palette.error.light
    }
}));

const getSingularOrPluralLabel = (count: number, singularLabel: keyof Labels): keyof Labels => {
    if (count > 1) {
        return `${singularLabel}.plural` as keyof Labels;
    } else {
        return singularLabel;
    }
};

export const ChatListMessagePreview: FunctionComponent<ChatListMessagePreviewProps> = observer(({
    messageId,
    draftMessageId,
    hideDraftMessage = false
}) => {
    const {
        emoji: {
            selectedEmojiSet
        }
    } = useStore();
    const {l} = useLocalization();
    const {classes} = useStyles();

    const message = useEntityById("messages", messageId)!;
    const draftMessage = useEntityById("draftMessages", draftMessageId);
    const messageSender = useEntityById("users", message.sender);
    const messageUploads = useEntitiesByIds("uploads", draftMessage?.uploads ?? message.uploads);
    const messageSticker = useEntityById("stickers", message.stickerId);
    const displayedMessage = draftMessage && !hideDraftMessage ? draftMessage : message;

    if (displayedMessage.deleted) {
        return <i>{l("message.deleted")}</i>;
    }

    const messageSenderName = draftMessage ? l("message.draft") : messageSender.firstName;
    const messageSenderClass = draftMessage ? classes.draftMessage : undefined;

    if (!draftMessage && messageSticker) {
        return renderSticker(messageSenderName, messageSticker, selectedEmojiSet, l);
    }

    if (displayedMessage.text && displayedMessage.text.length !== 0) {
        return renderText(messageSenderName, displayedMessage, messageSenderClass);
    }

    if (messageUploads.length !== 0) {
        if (messageUploads.length === 1) {
            return renderMessageWithSingleUpload(messageSenderName, messageUploads[0], l, messageSenderClass);
        } else {
            return renderMessageWithMultipleUploads(messageSenderName, displayedMessage, l, messageSenderClass);
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
    emojiSet: EmojiSet,
    l: TranslationFunction
): ReactElement => (
    <Fragment>
        {senderName}
        {": "}
        {sticker.emojiIds.length !== 0 && (
            <em-emoji size="20"
                      id={sticker.emojis[sticker.emojiIds[0]].id}
                      set={emojiSet}
            />
        )}
        {` [${l("sticker")}]`}
    </Fragment>
);

const renderText = (senderName: string, message: MessageEntity, senderClass?: string): ReactElement =>  (
    <Fragment>
        {senderClass ? <span className={senderClass}>{senderName}</span> : senderName}
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

const renderMessageWithSingleUpload = (
    senderName: string,
    upload: Upload<any>,
    l: TranslationFunction,
    senderClass?: string
): ReactElement => {
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
            {senderClass ? <span className={senderClass}>{senderName}</span> : senderName}
            {": "}
            {uploadDisplay}
        </Fragment>
    );
};

const renderMessageWithMultipleUploads = (
    senderName: string,
    message: MessageEntity,
    l: TranslationFunction,
    senderClass?: string
): ReactElement => {
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
            {senderClass ? <span className={senderClass}>{senderName}</span> : senderName}
            {": "}
            {attachmentsText}
        </Fragment>
    );
};

