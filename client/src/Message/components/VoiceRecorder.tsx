import React, {Fragment, FunctionComponent, ReactNode, useEffect, useState} from "react";
import {observer} from "mobx-react";
import {Close, KeyboardVoice, Pause} from "@mui/icons-material";
import {IconButton, Typography} from "@mui/material";
import {SendMessageButton} from "./SendMessageButton";
import {AudioPlayerControls} from "../../AudioPlayer";
import {useLocalization, useStore} from "../../store";
import {UploadType} from "../../api/types/response";

const POSTFIX_MAX_LENGTH = 6;

export const VoiceRecorder: FunctionComponent = observer(() => {
	const {
		voiceRecording: {
			recording,
			uploadPending,
			uploadedFileId,
			startRecording,
			endRecording,
			cleanRecording
		},
		messageCreation: {
			pending: messagePending,
			submitForm
		}
	} = useStore();
	const {l} = useLocalization();
	const [postfix, setPostfix] = useState("...");

	const interval = setInterval(() => {
		if (postfix.length === POSTFIX_MAX_LENGTH) {
			setPostfix("...");
		} else {
			setPostfix(`${postfix}.`);
		}
	}, 800);

	useEffect(() => {
		return () => clearInterval(interval);
	});

	const handleClick = (): void => {
		if (!recording) {
			startRecording();
		} else {
			endRecording();
		}
	};

	let content: ReactNode;

	if (uploadedFileId) {
		content = (
			<Fragment>
				<AudioPlayerControls audioId={uploadedFileId}
									 audioType={UploadType.VOICE_MESSAGE}
									 fullWidth
									 waveFormViewBox="0 0 150 5"
				/>
				<IconButton onClick={cleanRecording}>
					<Close/>
				</IconButton>
			</Fragment>
		);
	} else if (uploadPending) {
		content = (
			<Typography style={{width: "100%"}}>
				{l("message.voice.record.uploading")}{postfix}
			</Typography>
		);
	} else {
		content = (
			<Fragment>
				<IconButton onClick={handleClick}>
					{recording ? <Pause/> : <KeyboardVoice/>}
				</IconButton>
				<Typography style={{width: "100%"}}>
					{l("message.voice.record.placeholder")}{postfix}
				</Typography>
			</Fragment>
		);
	}

	return (
		<div style={{display: "flex", alignItems: "center"}}>
			{content}
			<SendMessageButton onClick={submitForm}
							   disabled={recording || uploadPending || messagePending}
			/>
		</div>
	);
});
