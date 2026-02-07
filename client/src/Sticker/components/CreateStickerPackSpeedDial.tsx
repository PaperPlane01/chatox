import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {SpeedDial, SpeedDialAction} from "@mui/material";
import {Add, FolderZip} from "@mui/icons-material";
import {useLocalization, useRouter} from "../../store";
import {Routes} from "../../router";

export const CreateStickerPackSpeedDial: FunctionComponent = observer(() => {
	const router = useRouter();
	const {l} = useLocalization();

	return (
		<SpeedDial ariaLabel=""
				   icon={<Add/>}
				   sx={theme => ({
					   position: "absolute",
					   bottom: theme.spacing(2),
					   right: theme.spacing(2)
				   })}
		>
			<SpeedDialAction icon={<Add/>}
							 tooltipTitle={l("sticker.pack.create")}
							 onClick={() => router.goTo(Routes.createStickerPack)}
			/>
			<SpeedDialAction icon={<FolderZip/>}
							 tooltipTitle={l("sticker.pack.import")}
							 onClick={() => router.goTo(Routes.stickerPackImport)}
			/>
		</SpeedDial>
	);
});
