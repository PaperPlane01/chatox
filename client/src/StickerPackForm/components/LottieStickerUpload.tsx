import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Image} from "@mui/icons-material";
import {DotLottieWorkerReact} from "@lottiefiles/dotlottie-react";
import {HttpStatusCode} from "axios";
import {AnimatedStickerUpload} from "./AnimatedStickerUpload";
import {StickerUploadProps} from "./StickerUploadProps";
import {useStickerUploadStyles} from "../styles";
import {API_UNREACHABLE_STATUS, ApiError} from "../../api";
import {TranslationFunction} from "../../localization";

const getErrorLabel = (error: ApiError, l: TranslationFunction): string => {
	if (error.status === HttpStatusCode.BadRequest) {
		return l("sticker.lottie.error.invalid");
	} else if (error.status === API_UNREACHABLE_STATUS) {
		return l("common.error.server-unreachable");
	} else {
		return l("sticker.lottie.error.unknown");
	}
};

export const LottieStickerUpload: FunctionComponent<StickerUploadProps> = observer(({
	stickerContainer
}) => {
	const {classes} = useStickerUploadStyles();

	return (
		<AnimatedStickerUpload stickerContainer={stickerContainer}
							   icon={<Image/>}
							   renderPreview={uploadContainer => (
								   <DotLottieWorkerReact src={uploadContainer?.uploadedFile?.uri ?? uploadContainer.url}
														 autoplay
														 loop
														 className={classes.stickerPreview}
														 useFrameInterpolation={false}
								   />
							   )}
							   renderErrorText={getErrorLabel}
		/>
	);
});
