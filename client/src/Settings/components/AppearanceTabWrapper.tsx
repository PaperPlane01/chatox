import React, {FunctionComponent} from "react";
import {Grid} from "@mui/material";
import {ThemePicker} from "../../Theme";
import {EmojiSetPicker} from "../../Emoji";

export const AppearanceTabWrapper: FunctionComponent = () => (
    <Grid container spacing={2}>
        <Grid size={12}>
            <ThemePicker/>
        </Grid>
        <Grid size={12}>
            <EmojiSetPicker/>
        </Grid>
    </Grid>
);