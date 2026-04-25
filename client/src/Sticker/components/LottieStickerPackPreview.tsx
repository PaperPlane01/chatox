import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {DotLottieWorkerReact} from "@lottiefiles/dotlottie-react";
import {BaseStickerPackPreviewProps} from "./BaseStickerPackPreviewProps";

export const LottieStickerPackPreview: FunctionComponent<BaseStickerPackPreviewProps> = observer(({
	upload,
	width,
	height
}) => (
	<div style={{
		width,
		height
	}}>
		<DotLottieWorkerReact src={upload.uri}
							  autoplay
							  loop
							  useFrameInterpolation={false}
							  renderConfig={{
								  freezeOnOffscreen: true,
								  autoResize: true
							  }}
		/>
	</div>
));
