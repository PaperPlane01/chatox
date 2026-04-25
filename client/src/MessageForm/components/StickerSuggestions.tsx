import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Card, CardContent, Theme} from "@mui/material";
import {makeStyles} from "tss-react/mui";
import {Sticker} from "../../Sticker";
import {useStore} from "../../store";
import {useEntitiesByIds} from "../../entities";

const useStyles = makeStyles()((theme: Theme) => ({
    stickerSuggestionsCard: {
		position: "relative",
		whiteSpace: "nowrap",
		overflowX: "auto",
		overflowY: "hidden",
		height: "100%"
	},
    stickerContainer: {
		height: 128,
		maxWidth: 128,
		display: "inline-block",
		zoom: 1,
		paddingLeft: theme.spacing(1),
		paddingRight: theme.spacing(1)
	}
}));

interface StickerSuggestionsProps {
	onStickerClick?: (stickerId: string) => void
}

export const StickerSuggestions: FunctionComponent<StickerSuggestionsProps> = observer(({
	onStickerClick
}) => {
	const {
		stickerSuggestions: {
			stickersIds
		},
		stickerPreviewDialog: {
			openDialog
		}
	} = useStore();
	const stickers = useEntitiesByIds("stickers", stickersIds);
	const {classes} = useStyles();

	if (stickers.length === 0) {
		return null;
	}

	return (
		<Card>
			<CardContent className={classes.stickerSuggestionsCard}>
				{stickers.map(sticker => (
					<div className={classes.stickerContainer}
						 key={`suggested_sticker_${sticker.id}`}
					>
						<Sticker stickerId={sticker.id}
								 stickerType={sticker.stickerType}
								 onClick={() => onStickerClick?.(sticker.id)}
								 onLongClick={() => openDialog(sticker.id)}
						/>
					</div>
				))}
			</CardContent>
		</Card>
	);
});
