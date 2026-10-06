import React, {FunctionComponent} from "react";
import {Grid} from "@mui/material";
import {ThemePicker} from "../../Theme/components";
import {EmojiSetPicker} from "../../Emoji/components";

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