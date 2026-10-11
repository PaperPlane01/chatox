import React, {Fragment, FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Grid} from "@mui/material";
import {CreateStickerPackSpeedDial, InstalledStickerPacksList, StickersPreferencesCard} from "../../Sticker/components";
import {HasRole} from "../../Authorization/components";

export const StickersTabWrapper: FunctionComponent = observer(() => (
	<Fragment>
		<Grid container spacing={2}>
			<Grid size={12}>
				<StickersPreferencesCard/>
			</Grid>
			<Grid size={12}>
				<InstalledStickerPacksList/>
			</Grid>
		</Grid>
		<HasRole role="ROLE_USER">
			<CreateStickerPackSpeedDial/>
		</HasRole>
	</Fragment>
));
