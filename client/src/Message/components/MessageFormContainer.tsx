import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {CreateMessageForm} from "./CreateMessageForm";
import {UpdateMessageForm} from "./UpdateMessageForm";
import {useStore} from "../../store";

export const MessageFormContainer: FunctionComponent = observer(() => {
    const {
        messageUpdate: {
            updatedMessageId
        }
    } = useStore();

    if (updatedMessageId) {
        return <UpdateMessageForm/>;
    } else {
        return <CreateMessageForm/>;
    }
});
