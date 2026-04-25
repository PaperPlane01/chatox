import React, {Fragment, FunctionComponent, useEffect, useState} from "react";
import {observer} from "mobx-react";
import {Forward, Reply} from "@mui/icons-material";
import {Divider} from "@mui/material";
import {LexicalEditor} from "lexical";
import {$convertFromMarkdownString} from "@lexical/markdown";
import {autoUpdate, offset, useFloating} from "@floating-ui/react";
import {RichTextMessageForm} from "./RichTextMessageForm";
import {MessageFormMessageCard} from "./MessageFormMessageCard";
import {StickerSuggestions} from "./StickerSuggestions";
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
			setDraftMessageConsumed,
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
			canSendVoiceMessages,
			canScheduleMessage
		}
	} = usePermissions();
	const [editor, setEditor] = useState<LexicalEditor | null>(null);
	const {refs, floatingStyles} = useFloating({
		placement: "top",
		strategy: "fixed",
		whileElementsMounted: autoUpdate,
		middleware: [
			offset({
				mainAxis: 32
			})
		]
	});

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
