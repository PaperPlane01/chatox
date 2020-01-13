import React, {FunctionComponent} from "react";
import {MuiThemeProvider} from "@material-ui/core";
import {SnackbarProvider} from "notistack";
import {cyan} from "./themes";

const {MobxRouter} = require("mobx-router");

export const App: FunctionComponent<{}> = () => (
    <SnackbarProvider maxSnack={3}>
        <MuiThemeProvider theme={cyan}>
            <MobxRouter/>
        </MuiThemeProvider>
    </SnackbarProvider>
);
