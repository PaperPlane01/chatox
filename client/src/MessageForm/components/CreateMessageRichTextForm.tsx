import React, {Fragment, FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Forward, Reply} from "@mui/icons-material";
import {Divider} from "@mui/material";
import {RichTextMessageForm} from "./RichTextMessageForm";
import {MessageFormMessageCard} from "./MessageFormMessageCard";
import {usePermissions, useStore} from "../../store";

export const CreateMessageRichTextForm: FunctionComponent = observer(() => {
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
			getNextMessageDate
		},
		messagesForwarding: {
			forwardModeActive,
			forwardedMessagesIds,
			reset
		}
	} = useStore();
	const {
		messages: {
			canSendVoiceMessages,
			canScheduleMessage
		}
	} = usePermissions();

	if (!selectedChatId) {
		return null;
	}

	const allowScheduled = canScheduleMessage(selectedChatId);
	const allowVoiceMessages = canSendVoiceMessages(selectedChatId);
	const nextMessageDate = getNextMessageDate(selectedChatId);

	return (
		<Fragment>
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
			<RichTextMessageForm initialText={formValues.text}
								 text={formValues.text}
								 hasAttachments={attachmentsIds.length !== 0}
								 emojiPickerExpanded={emojiPickerExpanded}
								 pending={pending}
								 allowScheduled={allowScheduled}
								 showVoiceMessageButton={allowVoiceMessages}
								 nextMessageDate={nextMessageDate}
								 forwardedMessagesCount={forwardedMessagesIds.length}
								 scheduledAt={formValues.scheduledAt}
								 resultMessage={resultMessage}
								 clearResultMessage={clearResultMessage}
								 onChange={text => setFormValue("text", text)}
								 onSubmit={submitForm}
								 onEmojiPickerExpanded={setEmojiPickerExpanded}
			/>
		</Fragment>
	);
});
