import React, {FunctionComponent} from "react";
import {Grid} from "@mui/material";
import {ThemePicker} from "../../Theme";
import {EmojiSetPicker} from "../../Emoji";

export const AppearanceTabWrapper: FunctionComponent = () => (
    <Grid container spacing={2}>
        <Grid item xs={12}>
            <ThemePicker/>
        </Grid>
        <Grid item xs={12}>
            <EmojiSetPicker/>
        </Grid>
    </Grid>
);