import React, {Fragment, FunctionComponent, useEffect, useState} from "react";
import {observer} from "mobx-react";
import {Close, KeyboardVoice, Pause} from "@mui/icons-material";
import {IconButton, Typography} from "@mui/material";
import {SendMessageButton} from "./SendMessageButton";
import {useLocalization, useStore} from "../../store";
import {AudioPlayerControls} from "../../AudioPlayer";
import {UploadType} from "../../api/types/response";

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
	const [suffix, setSuffix] = useState("...");

	const interval = setInterval(() => {
		if (suffix.length === 6) {
			setSuffix("...");
		} else {
			setSuffix(`${suffix}.`);
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

	return (
		<div style={{display: "flex", alignItems: "center"}}>
			{uploadedFileId
				? (
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
				)
				: (
					<Fragment>
						<IconButton onClick={handleClick}>
							{recording ? <Pause/> : <KeyboardVoice/>}
						</IconButton>
						<Typography style={{width: "100%"}}>
							{l("message.voice.record.placeholder")}{suffix}
						</Typography>
					</Fragment>
				)
			}
			<SendMessageButton onClick={submitForm}
							   disabled={recording || uploadPending || messagePending}
			/>
		</div>
	);
});
