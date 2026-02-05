import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Grid, Typography} from "@mui/material";
import {AppBar} from "../AppBar";
import {StickerPackImport} from "../StickerPackForm/components";
import {useLocalization} from "../store";
import {Layout} from "../Layout";
import {HasRole} from "../Authorization";

export const ImportStickerPackPage: FunctionComponent = observer(() => {
	const {l} = useLocalization();

	return (
		<Grid container>
			<Grid item xs={12}>
				<AppBar title="sticker.pack.import"/>
			</Grid>
			<Grid item xs={12}>
				<Layout>
					<HasRole role="ROLE_USER"
							 alternative={(
								 <Typography>
									 {l("sticker.pack.create.login-required")}
								 </Typography>
							 )}
					>
						<StickerPackImport/>
					</HasRole>
				</Layout>
			</Grid>
		</Grid>
	)
});

export default ImportStickerPackPage;
