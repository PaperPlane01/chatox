import React, {Fragment, FunctionComponent, useEffect, useRef} from "react";
import {observer} from "mobx-react";
import {Divider} from "@mui/material";
import {Reply} from "@mui/icons-material";
import {MessageFormMessageCard} from "./MessageFormMessageCard";
import {MessageForm} from "./MessageForm";
import {useStore} from "../../store";

export const CreateMessageForm: FunctionComponent = observer(() => {
    const {
        messageCreation: {
            formValues,
            pending,
            emojiPickerExpanded,
            referredMessageId,
            attachmentsIds,
            setFormValue,
            submitForm,
            setEmojiPickerExpanded,
            setReferredMessageId
        },
    } = useStore();

    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (formValues.text === "") {
            if (inputRef && inputRef.current) {
                inputRef.current.value = "";
            }
        }
    });

    useEffect(() => {
        if (referredMessageId && inputRef && inputRef.current) {
            inputRef.current.focus();
        }
    }, [referredMessageId]);

    return (
        <Fragment>
            {referredMessageId && (
                <MessageFormMessageCard messageId={referredMessageId}
                                        onClose={() => setReferredMessageId(undefined)}
                                        icon={(
                                            <Reply color="primary"
                                                   fontSize="medium"
                                            />
                                        )}
                />
            )}
            <Divider/>
            <MessageForm formValues={formValues}
                         pending={pending}
                         emojiPickerExpanded={emojiPickerExpanded}
                         allowScheduled
                         inputRef={inputRef}
                         attachmentsIds={attachmentsIds}
                         scheduledAt={formValues.scheduledAt}
                         setFormValue={setFormValue}
                         setEmojiPickerExpanded={setEmojiPickerExpanded}
                         submitForm={submitForm}
            />
        </Fragment>
    );
});
