import React, {Fragment, FunctionComponent} from "react";
import {observer} from "mobx-react";
import {CreateMessageForm} from "./CreateMessageForm";
import {UpdateMessageForm} from "./UpdateMessageForm";
import {useStore} from "../../store";
import {SendMessageButton} from "./SendMessageButton";

export const MessageFormContainer: FunctionComponent = observer(() => {
    const {
        messageUpdate: {
            updatedMessageId
        },
        messageUploads: {
            voiceMessageContainer
        },
        messageCreation: {
            submitForm
        }
    } = useStore();

    if (updatedMessageId) {
        return <UpdateMessageForm/>;
    } else if (voiceMessageContainer) {
        return (
            <Fragment>
                Placeholder for voice message
                <SendMessageButton onClick={submitForm}/>
            </Fragment>
        )
    } else {
        return <CreateMessageForm/>;
    }
});
