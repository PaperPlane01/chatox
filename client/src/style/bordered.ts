import {Theme} from "@mui/material";
import {CSSObject} from "tss-react";

export const createBorderedStyle = (theme: Theme, offset?: string): CSSObject => ({
    outline: "solid",
    outlineColor: theme.palette.divider,
    outlineWidth: "medium",
    outlineOffset: offset
});
