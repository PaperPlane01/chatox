import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {DotLottieWorkerReact} from "@lottiefiles/dotlottie-react";
import {BaseStickerProps} from "./BaseStickerProps";
import {createStyles, makeStyles} from "@mui/styles";
import {useAnimationData} from "../hooks";
import {stickerWrapperStyle} from "../styles";
import {useEntityById, useEntitySelector} from "../../entities";

const useStyles = makeStyles(() => createStyles({
	stickerWrapper: stickerWrapperStyle
}));

export const LottieSticker: FunctionComponent<BaseStickerProps> = observer(({
	stickerId,
	onClick,
	onLoad
}) => {
	const sticker = useEntityById("stickers", stickerId);
	const upload = useEntitySelector("uploads", entities => entities.uploads.findSticker(sticker.uploadId));
	const classes = useStyles();
	const animationData = useAnimationData(stickerId);

	const handleLoad = (): void => {
		if (onLoad) {
			onLoad();
		}
	};

	return (
		<div className={classes.stickerWrapper}
			 onClick={onClick}
		>
			<DotLottieWorkerReact src={animationData ? undefined : upload.uri}
								  data={animationData}
								  loop
								  autoplay
								  useFrameInterpolation={false}
								  layout={{
									  fit: "contain"
								  }}
								  renderConfig={{
									  freezeOnOffscreen: true
				                  }}
								  dotLottieRefCallback={dotLottie => dotLottie?.addEventListener("render", handleLoad)}
			/>
		</div>
	);
});
