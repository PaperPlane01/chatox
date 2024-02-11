import {createStyles, makeStyles} from "@mui/styles";
import {Theme} from "@mui/material";

export const createAttachFileButtonStyles = () => makeStyles((theme: Theme) => createStyles({
	attachFileButton: {
		padding: 0,
		textTransform: "none",
		"&:hover": {
			backgroundColor: "unset"
		},
		color: theme.palette.text.primary
	}
}));
