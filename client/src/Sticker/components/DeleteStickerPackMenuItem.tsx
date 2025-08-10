import React, {FunctionComponent, SyntheticEvent} from "react";
import {observer} from "mobx-react";
import {MenuItem, ListItemIcon, ListItemText} from "@mui/material";
import {Delete} from "@mui/icons-material";
import {useLocalization, useStore} from "../../store";

interface DeleteStickerPackMenuItemProps {
	stickerPackId: string,
	onClick?: (event: SyntheticEvent) => void
}

export const DeleteStickerPackMenuItem: FunctionComponent<DeleteStickerPackMenuItemProps> = observer(({
	stickerPackId,
	onClick
}) => {
	const {
		stickerPackDeletion: {
			setDeleteStickerPackDialogOpen,
			setStickerPackId
		}
	} = useStore();
	const {l} = useLocalization();

	const handleClick = (event: SyntheticEvent): void => {
		setStickerPackId(stickerPackId);
		setDeleteStickerPackDialogOpen(true);

		if (onClick) {
			onClick(event);
		}
	};

	return (
		<MenuItem onClick={handleClick}>
			<ListItemIcon>
				<Delete/>
			</ListItemIcon>
			<ListItemText>
				{l("common.delete")}
			</ListItemText>
		</MenuItem>
	);
});
