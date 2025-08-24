import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Button, CircularProgress} from "@mui/material";
import {useStore, useLocalization} from "../../store";

interface StickerPackInstallationButtonsProps {
	stickerPackId: string
}

export const StickerPackInstallationButtons: FunctionComponent<StickerPackInstallationButtonsProps> = observer(({
	stickerPackId
}) => {
	const {
		stickerPackInstallation: {
			pendingInstallationsMap,
			installStickerPack
		},
		stickerPackUninstallation: {
			pendingUninstallationsMap,
			uninstallStickerPack
		},
		installedStickerPacks: {
			isStickerPackInstalled
		}
	} = useStore();
	const {l} = useLocalization();
	const installed = isStickerPackInstalled(stickerPackId);

	return installed
		? (
			<Button variant="text"
					color="primary"
					onClick={() => uninstallStickerPack(stickerPackId)}
					disabled={Boolean(pendingInstallationsMap[stickerPackId])}
			>
				{pendingUninstallationsMap[stickerPackId] && <CircularProgress color="primary" size={15}/>}
				{l("sticker.pack.uninstall")}
			</Button>
		)
		: (
			<Button variant="text"
					color="primary"
					onClick={() => installStickerPack(stickerPackId)}
					disabled={Boolean(pendingInstallationsMap[stickerPackId])}
			>
				{pendingInstallationsMap[stickerPackId] && <CircularProgress color="primary" size={15}/>}
				{l("sticker.pack.install")}
			</Button>
		);
});
