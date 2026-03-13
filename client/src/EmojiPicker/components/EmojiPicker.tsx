import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {useMediaQuery, useTheme} from "@mui/material";
import {EmojiData} from "emoji-mart";
import data from "@emoji-mart/data";
import {EmojiMartPicker} from "./EmojiMartPicker";
import {useStore} from "../../store";

interface EmojiPickerProps {
	onEmojiPicked: (emoji: EmojiData) => void
}

export const EmojiPicker: FunctionComponent<EmojiPickerProps> = observer(({
	onEmojiPicked
}) => {
	const {
		emoji: {
			selectedEmojiSet
		}
	} = useStore();
	const theme = useTheme();
	const onSmallScreen = useMediaQuery(theme.breakpoints.down("lg"));
	const pickerStyles = onSmallScreen
		? {width: "100%", backgroundColor: theme.palette.background.paper}
		: {};

	return (
		<div style={pickerStyles}>
            <EmojiMartPicker set={selectedEmojiSet}
                             onEmojiSelect={onEmojiPicked}
                             autoFocus={false}
            />
        </div>
	);
});
