import {lighten, Theme} from "@mui/material";
import {CSSObject} from "tss-react";

export const createEmojiButtonStyles = (theme: Theme, highlight: boolean = false): CSSObject => ({
    aspectRatio: 1,
    borderRadius: "50%",
    borderColor: "transparent",
    placeItems: "center",
    backgroundColor: highlight ? lighten(theme.palette.primary.main, 0.1) : "inherit",
    cursor: "pointer"
});
