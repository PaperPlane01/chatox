import React, {Fragment, FunctionComponent, useEffect, useRef} from "react";
import {observer} from "mobx-react";
import {Divider} from "@mui/material";
import {Edit} from "@mui/icons-material";
import {MessageFormMessageCard} from "./MessageFormMessageCard";
import {PlainTextMessageForm} from "./PlainTextMessageForm";
import {useStore} from "../../store";

export const UpdateMessagePlainTextForm: FunctionComponent = observer(() => {
    const {
        messageUpdate: {
            formValues,
            pending,
            emojiPickerExpanded,
            attachmentsIds,
            updatedMessageId,
            resultMessage,
            clearResultMessage,
            setFormValue,
            submitForm,
            setEmojiPickerExpanded,
            setUpdatedMessageId
        }
    } = useStore();

    if (!updatedMessageId) {
        return null;
    }

    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (updatedMessageId && inputRef && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.value = formValues.text;
        }
    }, [updatedMessageId]);

    return (
        <Fragment>
            <MessageFormMessageCard messageId={updatedMessageId}
                                    onClose={() => setUpdatedMessageId(undefined)}
                                    mode="edit"
                                    icon={(
                                        <Edit color="primary"
                                              fontSize="medium"
                                        />
                                    )}
            />
            <Divider/>
            <PlainTextMessageForm formValues={formValues}
								  pending={pending}
								  emojiPickerExpanded={emojiPickerExpanded}
								  inputRef={inputRef}
								  attachmentsIds={attachmentsIds}
                                  resultMessage={resultMessage}
                                  clearResultMessage={clearResultMessage}
								  setFormValue={setFormValue}
								  setEmojiPickerExpanded={setEmojiPickerExpanded}
								  submitForm={submitForm}
            />
        </Fragment>
    );
});
