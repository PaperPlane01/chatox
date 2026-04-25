import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {FormControl, InputLabel, MenuItem, Select} from "@mui/material";
import {useLocalization} from "../../store";
import {STICKER_TYPES, StickerType} from "../../api/types/response";
import {Labels} from "../../localization";

interface StickersTypeSelectProps {
	value?: StickerType,
	onChange: (value: StickerType) => void
}

export const StickersTypeSelect: FunctionComponent<StickersTypeSelectProps> = observer(({
	value,
	onChange
}) => {
	const {l} = useLocalization();

	return (
		<FormControl fullWidth>
			<InputLabel id="stickerTypeLabel">{l("sticker.type")}</InputLabel>
			<Select id="stickerTypeSelect"
					labelId="stickerTypeLabel"
					value={value}
					onChange={event => onChange(event.target.value as StickerType)}
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
