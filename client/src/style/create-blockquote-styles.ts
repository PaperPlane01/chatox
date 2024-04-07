import {Theme} from "@mui/material";
import {CSSProperties} from "@mui/styles";

export const createBlockquoteStyles = (theme: Theme): CSSProperties => ({
	marginBlockStart: 0,
	marginBlockEnd: 0,
	marginInlineStart: 0,
	marginInlineEnd: 0,
	paddingLeft: theme.spacing(4),
	borderLeft: `${theme.spacing(0.5)} ${theme.palette.primary.main} solid`,
	position: "relative",
	"&::before": {
		content: "'\u201C'",
		position: "absolute",
		fontSize: "4em",
		color: theme.palette.primary.main,
		left: 10,
		top: -20
	},
	"&::after": {
		content: "''"
	}
});
