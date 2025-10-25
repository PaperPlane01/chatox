import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {DotLottieWorkerReact} from "@lottiefiles/dotlottie-react";
import {EditableStickerPreviewProps} from "./EditableStickerPreviewProps";

export const EditableLottieStickerPreview: FunctionComponent<EditableStickerPreviewProps> = observer(({
	stickerContainer
}) => {
	if (!stickerContainer.uploadContainer) {
		return null;
	}

	return (
		<DotLottieWorkerReact src={stickerContainer.uploadContainer.uploadedFile?.uri ?? stickerContainer.uploadContainer.url}
							  autoplay
							  loop
							  useFrameInterpolation={false}
		/>
	);
});