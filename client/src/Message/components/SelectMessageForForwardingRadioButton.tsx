import React, {FunctionComponent, MouseEvent, ChangeEvent} from "react";
import {observer} from "mobx-react";
import {Radio} from "@mui/material";
import {useStore} from "../../store";
import {ensureEventWontPropagate} from "../../utils/event-utils";

interface SelectMessageForForwardingRadioButtonProps {
    selected: boolean,
    messageId: string,
    className?: string
}

export const SelectMessageForForwardingRadioButton: FunctionComponent<SelectMessageForForwardingRadioButtonProps> = observer(({
    selected,
    messageId,
    className
}) => {
    const {
        messagesForwarding: {
            addMessage,
            removeMessage
        }
    } = useStore();

    const handleClick = (event: MouseEvent | ChangeEvent): void => {
        ensureEventWontPropagate(event);

        if (selected) {
            removeMessage(messageId);
        } else {
            addMessage(messageId);
        }
    }

    return (
        <Radio checked={selected}
               onClick={handleClick}
               onChange={handleClick}
               className={className}
        />
    );
});