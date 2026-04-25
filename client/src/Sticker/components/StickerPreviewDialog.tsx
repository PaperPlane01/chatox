import React, {Fragment, FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Button, Chip, Dialog, DialogActions, DialogContent, Typography} from "@mui/material";
import {makeStyles} from "tss-react/mui";
import {Sticker} from "./Sticker";
import {useLocalization, useStore} from "../../store";
import {Countdown} from "../../Countdown";
import {useEntityById} from "../../entities";
import {commonStyles} from "../../style";

const useStyles = makeStyles()(() => ({
    centered: commonStyles.centered
}));

export const StickerPreviewDialog: FunctionComponent = observer(() => {
	const {
		stickerPreviewDialog: {
			stickerId,
			closeDialog
		},
		chat: {
			selectedChatId
		},
		messageCreation: {
			sendSticker,
			getNextMessageDate
		},
		emoji: {
			selectedEmojiSet
		}
	} = useStore();
	const {l} = useLocalization();
	const sticker = useEntityById("stickers", stickerId);
	const {classes} = useStyles();

	if (!sticker) {
		return null;
	}

	const nextDate = selectedChatId ? getNextMessageDate(selectedChatId) : undefined;

	const handleSend = (): void => {
		closeDialog();
		sendSticker(sticker.id);
	};

	return (
		<Dialog open={true}
				fullWidth
				maxWidth="md"
				onClose={closeDialog}
		>
			<DialogContent>
				<div className={classes.centered}>
					<div>
						<Sticker stickerType={sticker.stickerType}
								 stickerId={sticker.id}
								 forceAutoplay
								 forceLoop
						/>
					</div>
				</div>
				{sticker.emojiIds.length !== 0 && (
					<Fragment>
						<Typography variant="h6">
							{l("sticker.emojis")}
						</Typography>
						{sticker.emojiIds.map(id => sticker.emojis[id]).map(emoji => (
							<em-emoji size="32"
								   id={emoji.id}
								   set={selectedEmojiSet}
								   key={emoji.id}
							/>
						))}
					</Fragment>
				)}
				{sticker.keywords.length !== 0 && (
					<Fragment>
						<Typography variant="h6">
							{l("sticker.keywords")}
						</Typography>
						{sticker.keywords.map(keyword => (
							<Chip label={keyword}
								  key={keyword}
							/>
						))}
					</Fragment>
				)}
			</DialogContent>
			<DialogActions>
				<Button variant="outlined"
						color="secondary"
						onClick={closeDialog}
				>
					{l("close")}
				</Button>
				{selectedChatId && (
					<Countdown date={nextDate}>
						<Button variant="contained"
								color="primary"
								onClick={handleSend}
						>
							{l("message.send")}
						</Button>
					</Countdown>
				)}
			</DialogActions>
		</Dialog>
	);
});
