import React, {Fragment, FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Grid} from "@mui/material";
import {CreateStickerPackSpeedDial, InstalledStickerPacksList, StickersPreferencesCard} from "../../Sticker";
import {HasRole} from "../../Authorization";

export const StickersTabWrapper: FunctionComponent = observer(() => (
	<Fragment>
		<Grid container spacing={2}>
			<Grid item xs={12}>
				<StickersPreferencesCard/>
			</Grid>
			<Grid item xs={12}>
				<InstalledStickerPacksList/>
			</Grid>
		</Grid>
		<HasRole role="ROLE_USER">
			<CreateStickerPackSpeedDial/>
		</HasRole>
	</Fragment>
));
