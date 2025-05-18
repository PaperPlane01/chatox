import React, {FunctionComponent, MouseEvent, SyntheticEvent} from "react";
import {ListItemIcon, ListItemText, MenuItem} from "@mui/material";
import {Edit} from "@mui/icons-material";
import {observer} from "mobx-react";
import {useLocalization, useRouter} from "../../store";
import {Routes} from "../../router";

interface EditStickerPackMenuItemProps {
	stickerPackId: string,
	onClick?: (event: SyntheticEvent) => void
}

export const EditStickerPackMenuItem: FunctionComponent<EditStickerPackMenuItemProps> = observer(({
	stickerPackId,
	onClick
}) => {
	const {l} = useLocalization();
	const router = useRouter();

	const handleClick = (event: MouseEvent<HTMLLIElement>): void => {
		if (onClick) {
			onClick(event);
		}

		router.goTo(Routes.stickerPackUpdate, {id: stickerPackId});
	}

	return (
		<MenuItem onClick={handleClick}>
			<ListItemIcon>
				<Edit/>
			</ListItemIcon>
			<ListItemText>
				{l("edit")}
			</ListItemText>
		</MenuItem>
	);
});
