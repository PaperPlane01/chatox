import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {CreateMessagePlainTextForm} from "./CreateMessagePlainTextForm";
import {CreateMessageRichTextForm} from "./CreateMessageRichTextForm";
import {UpdateMessagePlainTextForm} from "./UpdateMessagePlainTextForm";
import {UpdateMessageRichTextForm} from "./UpdateMessageRichTextForm";
import {VoiceRecorder} from "./VoiceRecorder";
import {useStore} from "../../store";
import {MessageEditorType} from "../../Chat";

export const MessageForm: FunctionComponent = observer(() => {
    const {
        messageUpdate: {
            updatedMessageId
        },
        messageUploads: {
            voiceMessageContainer
        },
        voiceRecording: {
            recording
        },
        chatsPreferences: {
            messageEditorType
        }
    } = useStore();

    if (updatedMessageId) {
        return messageEditorType === MessageEditorType.PLAIN_TEXT
            ? <UpdateMessagePlainTextForm/>
            : <UpdateMessageRichTextForm/>;
    } else if (recording || voiceMessageContainer) {
        return <VoiceRecorder/>;
    } else {
        return messageEditorType === MessageEditorType.PLAIN_TEXT
            ? <CreateMessagePlainTextForm/>
            : <CreateMessageRichTextForm/>;
    }
});
