import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {CreateMessageForm} from "./CreateMessageForm";
import {UpdateMessageForm} from "./UpdateMessageForm";
import {VoiceRecorder} from "./VoiceRecorder";
import {useStore} from "../../store";

export const MessageFormContainer: FunctionComponent = observer(() => {
    const {
        messageUpdate: {
            updatedMessageId
        },
        messageUploads: {
            voiceMessageContainer
        },
        voiceRecording: {
            recording
        }
    } = useStore();

    if (updatedMessageId) {
        return <UpdateMessageForm/>;
    } else if (recording || voiceMessageContainer) {
        return <VoiceRecorder/>;
    } else {
        return <CreateMessageForm/>;
    }
});
