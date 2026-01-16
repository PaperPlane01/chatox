import {createStyles, makeStyles} from "@mui/styles";
import {Theme} from "@mui/material";

export const useStickerUploadStyles = makeStyles((theme: Theme) => createStyles({
	stickerPreview: {
		width: 200,
		height: 200
	}
}));
