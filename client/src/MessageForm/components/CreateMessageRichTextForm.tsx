import React, {Fragment, FunctionComponent, useEffect, useState} from "react";
import {observer} from "mobx-react";
import {Forward, Reply} from "@mui/icons-material";
import {Divider} from "@mui/material";
import {LexicalEditor} from "lexical";
import {$convertFromMarkdownString} from "@lexical/markdown";
import {RichTextMessageForm} from "./RichTextMessageForm";
import {MessageFormMessageCard} from "./MessageFormMessageCard";
import {TRANSFORMERS} from "../../TextEditor/transformers";
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
			userId,
			resultMessage,
			draftMessageConsumed,
			clearResultMessage,
			setFormValue,
			submitForm,
			setEmojiPickerExpanded,
			setReferredMessageId,
			getNextMessageDate,
			setDraftMessageConsumed
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
	const [editor, setEditor] = useState<LexicalEditor | null>(null);

	useEffect(() => {
		if (!draftMessageConsumed) {
			if (editor) {
				editor.update(() => $convertFromMarkdownString(formValues.text, TRANSFORMERS));
				setDraftMessageConsumed(true);
			}
		}

		// for some reason, placing only draftMessageConsumed here is not enough
	}, [draftMessageConsumed, formValues.text]);

	if (!selectedChatId && !userId) {
		return null;
	}

	const allowScheduled = Boolean(selectedChatId && canScheduleMessage(selectedChatId));
	const allowVoiceMessages = Boolean(selectedChatId && canSendVoiceMessages(selectedChatId));
	const nextMessageDate = selectedChatId ? getNextMessageDate(selectedChatId) : undefined;

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
								 onEditorReady={setEditor}
								 editorKey={`message-editor-${selectedChatId}`}
			/>
		</Fragment>
	);
});
