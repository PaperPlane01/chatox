import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {FormControl, InputLabel, MenuItem, Select} from "@mui/material";
import {useLocalization, useStore} from "../../store";
import {STICKER_TYPES, StickerType} from "../../api/types/response";
import {Labels} from "../../localization";

export const StickersTypeSelect: FunctionComponent = observer(() => {
	const {
		stickerPackCreation: {
			formValues,
			setFormValue
		}
	} = useStore();
	const {l} = useLocalization();

	return (
		<FormControl fullWidth>
			<InputLabel id="stickerTypeLabel">{l("sticker.type")}</InputLabel>
			<Select id="stickerTypeSelect"
					labelId="stickerTypeLabel"
					value={formValues.stickersType}
					onChange={event => setFormValue("stickersType", event.target.value as StickerType)}
					fullWidth
			>
				{STICKER_TYPES.map(stickerType => (
					<MenuItem key={`stickerTypeItem_${stickerType}`}
							  value={stickerType}
					>
						{l(`sticker.type.${stickerType}` as keyof Labels)}
					</MenuItem>
				))}
			</Select>
		</FormControl>
	);
});
