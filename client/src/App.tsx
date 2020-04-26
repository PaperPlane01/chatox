import React, {FunctionComponent} from "react";
import {MuiThemeProvider, CssBaseline} from "@material-ui/core";
import {MuiPickersUtilsProvider} from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";
import {SnackbarProvider} from "notistack";
import {cyan} from "./themes";
import {Localized, localized} from "./localization";

const {MobxRouter} = require("mobx-router");

const _App: FunctionComponent<Localized> = ({dateFnsLocale}) => (
    <MuiPickersUtilsProvider utils={DateFnsUtils}
                             locale={dateFnsLocale}
    >
        <SnackbarProvider maxSnack={3}>
            <MuiThemeProvider theme={cyan}>
                <CssBaseline/>
                <MobxRouter/>
            </MuiThemeProvider>
        </SnackbarProvider>
    </MuiPickersUtilsProvider>
);

export const App = localized(_App) as FunctionComponent;
