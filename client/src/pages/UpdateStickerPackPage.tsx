import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {CircularProgress, Grid, Typography} from "@mui/material";
import {makeStyles} from "tss-react/mui";
import {AppBar} from "../AppBar/components";
import {UpdateStickerPackForm} from "../StickerPackForm/components";
import {getLoadErrorText} from "../Sticker/utils";
import {HasRole} from "../Authorization/components";
import {Layout} from "../Layout/components";
import {useLocalization, usePermissions, useStore} from "../store";
import {useEntityById} from "../entities";
import {commonStyles} from "../style";

const useStyle = makeStyles()(() => ({
    centered: commonStyles.centered
}));

export const UpdateStickerPackPage: FunctionComponent = observer(() => {
	const {l} = useLocalization();
	const {stickerPacks} = usePermissions();
	const {
		stickerPackUpdate: {
			fetchingStickerPack,
			fetchingStickerPackError,
			stickerPackId
		}
	} = useStore();
	const stickerPack = useEntityById("stickerPacks", stickerPackId);
	const {classes} = useStyle();

	return (
		<Grid container>
			<Grid size={12}>
				<AppBar/>
			</Grid>
			<Grid size={12}>
				<Layout>
					{fetchingStickerPack && (
						<CircularProgress size={50}
										  color="primary"
										  className={classes.centered}
						/>
					)}
					{fetchingStickerPackError && (
						<Typography style={{color: "red"}}>
							{getLoadErrorText(fetchingStickerPackError, l)}
						</Typography>
					)}
					{stickerPack && (
						<HasRole role="ROLE_USER"
								 additionalCondition={stickerPacks.canEditStickerPack(stickerPack)}
								 alternative={(
									 <Typography>
										 {l("sticker.pack.update.no-permission")}
									 </Typography>
								 )}
						>
							<UpdateStickerPackForm/>
						</HasRole>
					)}
				</Layout>
			</Grid>
		</Grid>
	);
});

export default UpdateStickerPackPage;
