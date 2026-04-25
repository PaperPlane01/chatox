import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {HttpStatusCode} from "axios";
import {Videocam} from "@mui/icons-material";
import ReactPlayer from "react-player";
import {AnimatedStickerUpload} from "./AnimatedStickerUpload";
import {StickerUploadProps} from "./StickerUploadProps";
import {useStickerUploadStyles} from "../styles";
import {API_UNREACHABLE_STATUS, ApiError} from "../../api";
import {TranslationFunction} from "../../localization";

const getErrorLabel = (error: ApiError, l: TranslationFunction): string => {
	if (error.status === HttpStatusCode.BadRequest) {
		return l("sticker.video.error.invalid");
	} else if (error.status === API_UNREACHABLE_STATUS) {
		return l("common.error.server-unreachable");
	} else {
		return l("sticker.video.error.unknown");
	}
};

export const VideoStickerUpload: FunctionComponent<StickerUploadProps> = observer(({
	stickerContainer
}) => {
	const {classes} = useStickerUploadStyles();

	return (
		<AnimatedStickerUpload stickerContainer={stickerContainer}
							   icon={<Videocam/>}
							   renderPreview={uploadContainer=> (
								   <ReactPlayer src={uploadContainer?.uploadedFile?.uri ?? uploadContainer.url}
												autoPlay
												loop
												muted
												playsInline
												controls={false}
												className={classes.stickerPreview}
								   />
							   )}
							   renderErrorText={getErrorLabel}
		/>
	);
});
