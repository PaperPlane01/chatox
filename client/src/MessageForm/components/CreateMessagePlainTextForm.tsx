import React, {Fragment, FunctionComponent, useEffect, useRef} from "react";
import {observer} from "mobx-react";
import {Divider} from "@mui/material";
import {Forward, Reply} from "@mui/icons-material";
import {autoUpdate, offset, useFloating} from "@floating-ui/react";
import {MessageFormMessageCard} from "./MessageFormMessageCard";
import {PlainTextMessageForm} from "./PlainTextMessageForm";
import {StickerSuggestions} from "./StickerSuggestions";
import {usePermissions, useStore} from "../../store";
import {isDefined} from "../../utils/object-utils";

export const CreateMessagePlainTextForm: FunctionComponent = observer(() => {
    const {
        messageCreation: {
            formValues,
            pending,
            emojiPickerExpanded,
            referredMessageId,
            attachmentsIds,
            selectedChatId,
			resultMessage,
			clearResultMessage,
            setFormValue,
            submitForm,
            setEmojiPickerExpanded,
            setReferredMessageId,
            getNextMessageDate,
			sendSticker
        },
        messagesForwarding: {
            forwardModeActive,
            forwardedMessagesIds,
            reset
        },
		stickerSuggestions: {
			stickersIds
		}
    } = useStore();
    const {
        messages: {
            canSendVoiceMessages
        }
    } = usePermissions();
    const inputRef = useRef<HTMLInputElement>(null);
	const {refs, floatingStyles} = useFloating({
		placement: "top",
		strategy: "fixed",
		whileElementsMounted: autoUpdate,
		middleware: [
			offset({
				mainAxis: 36
			})
		]
	});

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

    const nextMessageDate = isDefined(selectedChatId) ? getNextMessageDate(selectedChatId) : undefined;
    const showVoiceMessageButton = isDefined(selectedChatId)
        && canSendVoiceMessages(selectedChatId);

    return (
        <Fragment>
            <div ref={refs.setReference}>
				{forwardModeActive && (
					<MessageFormMessageCard mode="forward"
											onClose={() => reset()}
											messageId={forwardedMessagesIds.length === 1 ? forwardedMessagesIds[0] : undefined}
											messagesCount={forwardedMessagesIds.length}
											icon={(
												<Forward color="primary"
														 fontSize="medium"
												/>
											)}
					/>
				)}
				{referredMessageId && (
					<MessageFormMessageCard messageId={referredMessageId}
											onClose={() => setReferredMessageId(undefined)}
											icon={(
												<Reply color="primary"
													   fontSize="medium"
												/>
											)}
											mode="reply"
					/>
				)}
				<Divider/>
				<PlainTextMessageForm formValues={formValues}
									  pending={pending}
									  emojiPickerExpanded={emojiPickerExpanded}
									  allowScheduled
									  inputRef={inputRef}
									  attachmentsIds={attachmentsIds}
									  scheduledAt={formValues.scheduledAt}
									  nextMessageDate={nextMessageDate}
									  forwardedMessagesCount={forwardedMessagesIds.length}
									  showVoiceMessageButton={showVoiceMessageButton}
									  resultMessage={resultMessage}
									  clearResultMessage={clearResultMessage}
									  setFormValue={setFormValue}
									  setEmojiPickerExpanded={setEmojiPickerExpanded}
									  submitForm={submitForm}
				/>
			</div>
			{stickersIds.length !== 0 && (
				<div ref={refs.setFloating}
					 style={{
						 ...floatingStyles,
						 width: refs.reference?.current?.getBoundingClientRect().width,
						 height: 150
					 }}
				>
					<StickerSuggestions onStickerClick={stickerId => sendSticker(stickerId, true)}/>
				</div>
			)}
        </Fragment>
    );
});
