import React, {FunctionComponent, useState} from "react";
import {observer} from "mobx-react";
import {createStyles, makeStyles} from "@mui/styles";
import {type DotLottieWorker, DotLottieWorkerReact} from "@lottiefiles/dotlottie-react";
import {BaseStickerProps} from "./BaseStickerProps";
import {useAnimationData, useStickerLongClick} from "../hooks";
import {stickerWrapperStyle} from "../styles";
import {useEntityById, useEntitySelector} from "../../entities";
import {useStore} from "../../store";
import {isDefined} from "../../utils/object-utils";

const useStyles = makeStyles(() => createStyles({
	stickerWrapper: stickerWrapperStyle
}));

export const LottieSticker: FunctionComponent<BaseStickerProps> = observer(({
	stickerId,
	forceAutoplay = false,
	forceLoop = false,
	onClick,
	onLongClick,
	onLoad
}) => {
	const sticker = useEntityById("stickers", stickerId);
	const upload = useEntitySelector("uploads", entities => entities.uploads.findSticker(sticker.uploadId));
	const classes = useStyles();
	const animationData = useAnimationData(stickerId);
	const [dotLottie, setDotLottie] = useState<DotLottieWorker | null>(null);
	const [playsCount, setPlaysCount] = useState(0);
	const {
		stickersPreferences: {
			autoplay,
			loop,
			loopsCount
		}
	} = useStore();
	const longPressHandlers = useStickerLongClick({stickerId, onClick, onLongClick});

	const handleLoad = (): void => {
		if (onLoad) {
			onLoad();
		}
	};

	const handleLoop = (): void => {
		if (playsCount !== loopsCount) {
			setPlaysCount(prevState => prevState + 1);
		}
	};

	// For some reason setting loopCount property to DotLottieWorkerReact doesn't work,
	// so we have to handle the playback count ourselves.
	if (!forceLoop && isDefined(loopsCount) && loopsCount > 0 && isDefined(dotLottie) && playsCount === loopsCount) {
		dotLottie.freeze().then(() => dotLottie.setFrame(0));
	}

	return (
		<div className={classes.stickerWrapper}
			 {...longPressHandlers}
		>
			<DotLottieWorkerReact src={animationData ? undefined : upload.uri}
								  data={animationData}
								  loop={forceLoop || loop}
								  autoplay={forceAutoplay || autoplay}
								  useFrameInterpolation={false}
								  layout={{
									  fit: "contain"
								  }}
								  renderConfig={{
									  freezeOnOffscreen: true
				                  }}
								  dotLottieRefCallback={dotLottie => {
									  setDotLottie(dotLottie);
									  dotLottie?.addEventListener("render", handleLoad);

									  if (!forceLoop && isDefined(loopsCount) && loopsCount > 0) {
										  dotLottie?.addEventListener("loop", handleLoop);
									  }
								  }}
			/>
		</div>
	);
});
