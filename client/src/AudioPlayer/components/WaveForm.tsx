import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {lighten, useTheme} from "@mui/material";

export interface WaveFormProps {
	waveForm: number[],
	playerProgress: number,
	audioId: string,
	currentlyPlaying: boolean
}

const MAX_HEIGHT = 10;

export const WaveForm: FunctionComponent<WaveFormProps> = observer(({
	waveForm,
	playerProgress,
	audioId,
	currentlyPlaying
}) => {
	const theme = useTheme();
	const playedColor = theme.palette.primary.main;
	const notPlayedColor = lighten(theme.palette.primary.main, 0.4);
	const chunkWidthPercentage = (1 / waveForm.length) * 100;

	return (
		<svg viewBox="0 0 100 10"
			 transform="scale(1, -1)"
		>
			{waveForm.map((waveValue, index) => (
				<rect x={`${index * chunkWidthPercentage}%`}
					  width={1}
					  height={MAX_HEIGHT * waveValue}
					  fill={(currentlyPlaying && (index / waveForm.length < playerProgress))
						  ? playedColor
						  : notPlayedColor
				}
					  key={`${audioId}-waveChunk-${index}`}
				/>
			))}
		</svg>
	);
});
