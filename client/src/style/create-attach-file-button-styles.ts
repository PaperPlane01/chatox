import {Theme} from "@mui/material";
import {makeStyles} from "tss-react/mui";

export const createAttachFileButtonStyles = () => makeStyles()((theme: Theme) => ({
	attachFileButton: {
		padding: 0,
		textTransform: "none",
		"&:hover": {
			backgroundColor: "unset"
		},
		color: theme.palette.text.primary
	}
}));
