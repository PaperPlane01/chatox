import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {CircularProgress, Grid, Typography} from "@mui/material";
import {createStyles, makeStyles} from "@mui/styles";
import {AppBar} from "../AppBar/components";
import {Layout} from "../Layout/components";
import {StickerPackCard} from "../Sticker/components";
import {getLoadErrorText} from "../Sticker/utils";
import {useStore, useLocalization} from "../store";
import {commonStyles} from "../style";

const useStyle = makeStyles(() => createStyles({
	centered: commonStyles.centered
}));

export const StickerPackPage: FunctionComponent = observer(() => {
	const {
		stickerPack: {
			stickerPackId,
			pending,
			error
		}
	} = useStore();
	const {l} = useLocalization();
	const classes = useStyle();

	return (
		<Grid container>
			<Grid item xs={12}>
				<AppBar/>
			</Grid>
			<Grid item xs={12}>
				<Layout>
					{pending && (
						<CircularProgress size={50}
										  color="primary"
										  className={classes.centered}
						/>
					)}
					{error && (
						<Typography>
							{getLoadErrorText(error, l)}
						</Typography>
					)}
					<StickerPackCard stickerPackId={stickerPackId}/>
				</Layout>
			</Grid>
		</Grid>
	);
});

export default StickerPackPage;
