import {makeAutoObservable} from "mobx";
import {UploadMessageAttachmentsStore} from "./UploadMessageAttachmentsStore";
import {SnackbarService} from "../../Snackbar";
import {LocaleStore} from "../../localization";
import {UploadedFileContainer} from "../../utils/file-utils";

export class RecordVoiceMessageStore {
	recording = false;

	blob?: Blob = undefined;

	chunks: Blob[] = [];

	mediaRecorder?: MediaRecorder = undefined;

	get voiceMessageContainer(): UploadedFileContainer | undefined {
		return this.messageAttachments.voiceMessageContainer;
	}

	get uploadPending(): boolean {
		return this.voiceMessageContainer?.pending ?? false;
	}

	get uploadedFileId(): string | undefined {
		return this.voiceMessageContainer?.uploadedFile?.id;
	}

	constructor(private readonly messageAttachments: UploadMessageAttachmentsStore,
				private readonly locale: LocaleStore,
				private readonly snackbarService: SnackbarService) {
		makeAutoObservable(this);
	}

	startRecording = async (): Promise<void> => {
		if (!navigator?.mediaDevices?.getUserMedia) {
			this.snackbarService.error(
				this.locale.getCurrentLanguageLabel("message.voice.record.error.not-supported")
			);
			return;
		}

		try {
			const stream = await navigator.mediaDevices.getUserMedia({
				audio: true
			});
			this.mediaRecorder = new MediaRecorder(stream);
			this.mediaRecorder.start();
			this.addEventHandlers(this.mediaRecorder);
			this.recording = true;
		} catch (error) {
			console.error(error);
			const message = (error as any).message;

			if (message && message === "Requested device not found") {
				this.snackbarService.error(
					this.locale.getCurrentLanguageLabel("message.voice.record.error.not-supported")
				);
			} else {
				this.snackbarService.error(
					this.locale.getCurrentLanguageLabel("message.voice.record.error.unknown")
				);
			}
		}
	}

	private addEventHandlers = (mediaRecorder: MediaRecorder): void => {
		mediaRecorder.ondataavailable = event => {
			console.log("new data!!")
			this.chunks.push(event.data);
		};
		mediaRecorder.onstop = () => {
			this.blob = new Blob(this.chunks, {
				type: "audio/mpeg-3"
			});
			const file = new File([this.blob], "voice_recording.mp3", {
				lastModified: new Date().getUTCDate(),
				type: "audio/mpeg-3"
			});
			this.messageAttachments.attachVoiceMessage(file);
		};
	}

	endRecording = (): void => {
		this.recording = false;

		if (!this.mediaRecorder) {
			return;
		}

		this.mediaRecorder.stop();
		this.mediaRecorder = undefined;
	}

	cleanRecording = (): void => {
		this.mediaRecorder = undefined;
		this.chunks = [];
		this.blob = undefined;

		if (this.voiceMessageContainer) {
			this.messageAttachments.removeAttachment(this.voiceMessageContainer.localId);
		}
	}
}
