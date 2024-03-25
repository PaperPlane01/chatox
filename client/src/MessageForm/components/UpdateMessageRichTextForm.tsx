import React, {Fragment, FunctionComponent, useEffect, useState} from "react";
import {observer} from "mobx-react";
import {Divider} from "@mui/material";
import {Edit} from "@mui/icons-material";
import {useLexicalComposerContext} from "@lexical/react/LexicalComposerContext";
import {MessageFormMessageCard} from "./MessageFormMessageCard";
import {RichTextMessageForm} from "./RichTextMessageForm";
import {useStore} from "../../store";
import {LexicalEditor} from "lexical";

export const UpdateMessageRichTextForm: FunctionComponent = observer(() => {
	const {
		messageUpdate: {
			formValues,
			pending,
			emojiPickerExpanded,
			attachmentsIds,
			updatedMessageId,
			setFormValue,
			submitForm,
			setEmojiPickerExpanded,
			setUpdatedMessageId
		}
	} = useStore();
	const [editor, setEditor] = useState<LexicalEditor | undefined>(undefined);

	if (!updatedMessageId) {
		return null;
	}

	useEffect(() => {
		if (editor) {
			editor.focus();
		}
	}, [updatedMessageId, editor]);

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
			<RichTextMessageForm initialText={formValues.text}
								 text={formValues.text}
								 hasAttachments={attachmentsIds.length !== 0}
								 emojiPickerExpanded={emojiPickerExpanded}
								 pending={pending}
								 onChange={text => setFormValue("text", text)}
								 onSubmit={submitForm}
								 onEmojiPickerExpanded={setEmojiPickerExpanded}
								 onEditorReady={setEditor}
			/>
		</Fragment>
	);
});
