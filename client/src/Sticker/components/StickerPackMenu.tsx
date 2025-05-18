import React, {Fragment, FunctionComponent, ReactNode, SyntheticEvent, useCallback} from "react";
import {IconButton, Menu} from "@mui/material";
import {MoreVert} from "@mui/icons-material";
import {observer} from "mobx-react";
import {bindMenu, bindToggle, usePopupState} from "material-ui-popup-state/hooks";
import {EditStickerPackMenuItem} from "./EditStickerPackMenuItem";
import {useAuthorization, usePermissions} from "../../store";
import {ensureEventWontPropagate} from "../../utils/event-utils";
import {useEntityById} from "../../entities";

interface StickerPackMenuProps {
	stickerPackId: string
}

export const StickerPackMenu: FunctionComponent<StickerPackMenuProps> = observer(({
	stickerPackId
}) => {
	const popupState = usePopupState({
		popupId: `sticker-pack-${stickerPackId}-menu}`,
		variant: "popover"
	});
	const {currentUser} = useAuthorization();
	const {
		stickerPacks: {
			canEditStickerPack
		}
	} = usePermissions();

	if (!currentUser) {
		return null;
	}

	const menuHandlers = bindToggle(popupState);
	const menuOnClick = menuHandlers.onClick;
	menuHandlers.onClick = event => {
		ensureEventWontPropagate(event);
		menuOnClick(event);
	};

	const handleMenuItemClick = useCallback(
		(event: SyntheticEvent) => {
			ensureEventWontPropagate(event);
			popupState.close();
		},
		[stickerPackId]
	);

	const stickerPack = useEntityById("stickerPacks", stickerPackId);
	const menuItems: ReactNode[] = [];

	if (canEditStickerPack(stickerPack)) {
		menuItems.push(
			<EditStickerPackMenuItem stickerPackId={stickerPackId}
									 onClick={handleMenuItemClick}
			/>
		);
	}

	if (menuItems.length === 0) {
		return null;
	}

	return (
		<Fragment>
			<IconButton {...menuHandlers}>
				<MoreVert/>
			</IconButton>
			<Menu {...bindMenu(popupState)}>
				{menuItems}
			</Menu>
		</Fragment>
	);
});
