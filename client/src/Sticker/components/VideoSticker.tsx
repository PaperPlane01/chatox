import React, {FunctionComponent, useRef, useState} from "react";
import {observer} from "mobx-react";
import {makeStyles} from "tss-react/mui";
import ReactPlayer from "react-player";
import {BaseStickerProps} from "./BaseStickerProps";
import {useStickerLongClick} from "../hooks";
import {stickerWrapperStyle} from "../styles";
import {useEntityById, useEntitySelector} from "../../entities";
import {useStore} from "../../store";
import {isDefined} from "../../utils/object-utils";

const useStyles = makeStyles()(() => ({
    stickerWrapper: stickerWrapperStyle
}));

export const VideoSticker: FunctionComponent<BaseStickerProps> = observer(({
	stickerId,
	forceAutoplay = false,
	forceLoop = false,
	onClick,
	onLongClick,
	onLoad
 }) => {
	const sticker = useEntityById("stickers", stickerId);
	const upload = useEntitySelector("uploads", entities => entities.uploads.findSticker(sticker.uploadId));
	const {classes} = useStyles();
	const {
		stickersPreferences: {
			autoplay,
			loop,
			loopsCount,
		}
	} = useStore();
	const infiniteLoop = forceLoop || (loop && (!isDefined(loopsCount) || loopsCount === 0));
	const logPressHandlers = useStickerLongClick({stickerId, onClick, onLongClick});
	const playerRef = useRef<HTMLVideoElement>(null);
	const [playsCount, setPlaysCount] = useState(1);

	const handleLoop = (): void => {
		if (infiniteLoop || !isDefined(loopsCount)) {
			return;
		}

		if (playsCount !== loopsCount) {
			playerRef.current?.play();
			setPlaysCount(prevState => prevState + 1);
		} else if (playerRef?.current) {
			playerRef.current.currentTime = 0;
		}
	};

	return (
		<div className={classes.stickerWrapper}
			 {...logPressHandlers}
		>
			<ReactPlayer src={upload.uri}
						 controls={false}
						 muted
						 playsInline
						 autoPlay={forceAutoplay || autoplay}
						 loop={infiniteLoop}
						 onLoad={onLoad}
						 onEnded={handleLoop}
						 ref={playerRef}
						 style={{
							 width: "100%",
							 height: "100%",
							 maxWidth: 256,
							 maxHeight: 256,
							 display: "inline-block"
						 }}
			/>
		</div>
	);
});
