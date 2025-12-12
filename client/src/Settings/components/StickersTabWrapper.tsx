import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Grid} from "@mui/material";
import {StickersPreferencesCard, InstalledStickerPacksList} from "../../Sticker";

export const StickersTabWrapper: FunctionComponent = observer(() => (
	<Grid container spacing={2}>
		<Grid item xs={12}>
			<StickersPreferencesCard/>
		</Grid>
		<Grid item xs={12}>
			<InstalledStickerPacksList/>
		</Grid>
	</Grid>
));
