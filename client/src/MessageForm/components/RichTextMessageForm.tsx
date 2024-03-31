import React, {FunctionComponent, ReactNode, useEffect, useState} from "react";
import {observer} from "mobx-react";
import {createStyles, makeStyles} from "@mui/styles";
import {CLEAR_EDITOR_COMMAND, LexicalEditor} from "lexical";
import {AttachFilesButton} from "./AttachFilesButton";
import {RecordVoiceMessageButton} from "./RecordVoiceMessageButton";
import {SendMessageButton} from "./SendMessageButton";
import {OpenScheduleMessageDialogButton} from "./OpenScheduleMessageDialogButton";
import {useLocalization, useStore} from "../../store";
import {adornmentStyle, EnterAction, TextEditor} from "../../TextEditor";
import {ClaimRewardButton} from "../../Reward";
import {SendMessageButton as SendMessageButtonType} from "../../Chat";
import {Countdown} from "../../Countdown";
import {MessageEntity} from "../../Message";

const useStyles = makeStyles(() => createStyles({
	adornment: adornmentStyle
}));

interface RichTextMessageFormProps {
	initialText: string,
	text: string,
	hasAttachments: boolean,
	emojiPickerExpanded: boolean,
	allowScheduled?: boolean,
	scheduledAt?: Date,
	nextMessageDate?: Date,
	forwardedMessagesCount?: number,
	showVoiceMessageButton?: boolean,
	pending: boolean,
	resultMessage?: MessageEntity,
	clearResultMessage?: () => void,
	onChange: (text: string) => void,
	onSubmit: () => void,
	onEmojiPickerExpanded: (emojiPickerExpanded: boolean) => void,
	onEditorReady?: (editor: LexicalEditor) => void
}

export const RichTextMessageForm: FunctionComponent<RichTextMessageFormProps> = observer(({
	initialText,
	text,
	hasAttachments,
	emojiPickerExpanded,
	allowScheduled = false,
	showVoiceMessageButton = false,
	forwardedMessagesCount = 0,
	nextMessageDate,
	scheduledAt,
	pending,
	resultMessage,
	clearResultMessage,
	onChange,
	onEmojiPickerExpanded,
	onSubmit,
	onEditorReady
}) => {
	const {
		chatsPreferences: {
			sendMessageButton
		}
	} = useStore();
	const {l} = useLocalization();
	const [editor, setEditor] = useState<LexicalEditor | null>(null);
	const classes = useStyles();

	const handleEditorReady = (editor: LexicalEditor): void => {
		setEditor(editor);

		if (onEditorReady) {
			onEditorReady(editor);
		}
	};

	useEffect(() => {
		if (resultMessage && clearResultMessage && editor) {
			editor.dispatchCommand(
				CLEAR_EDITOR_COMMAND,
				undefined
			);
			clearResultMessage();
		}
	}, [resultMessage, clearResultMessage, editor]);

	const showSendMessageButton = !showVoiceMessageButton
		|| text.length !== 0
		|| hasAttachments
		|| forwardedMessagesCount > 0;
	const ctrlEnterAction: EnterAction = sendMessageButton === SendMessageButtonType.CTRL_ENTER
		? onSubmit
		: "insertNewParagraph";
	const enterAction: EnterAction = sendMessageButton === SendMessageButtonType.ENTER
		? onSubmit
		: "insertNewParagraph";

	let button: ReactNode = null;

	if (showSendMessageButton) {
		button = (
			<SendMessageButton onClick={onSubmit}
							   disabled={pending}
			/>
		);
	} else if (showVoiceMessageButton) {
		button = <RecordVoiceMessageButton/>;
	}

	return (
		<TextEditor initialText={initialText}
					onUpdate={onChange}
					placeholder={l("message.type-something")}
					onEnter={enterAction}
					onCtrlEnter={ctrlEnterAction}
					emojiPickerVariant="emoji-and-sticker-picker"
					startAdornment={(
						<div className={classes.adornment}>
							<AttachFilesButton/>
							<ClaimRewardButton/>
						</div>
					)}
					endAdornment={(
						<div className={classes.adornment}>
							{allowScheduled && scheduledAt && <OpenScheduleMessageDialogButton/>}
							<Countdown date={nextMessageDate}>
								{button}
							</Countdown>
						</div>
					)}
					emojiPickerExpanded={emojiPickerExpanded}
					setEmojiPickerExpanded={onEmojiPickerExpanded}
					onEditorReady={handleEditorReady}
		/>
	);
});
