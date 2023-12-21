import {Theme} from "@mui/material";
import {CSSProperties} from "@mui/styles";

export const createBorderedStyle = (theme: Theme, offset?: string): CSSProperties => ({
    outline: "solid",
    outlineColor: theme.palette.divider,
    outlineWidth: "medium",
    outlineOffset: offset
});
