import React, {FunctionComponent} from "react";
import {CssBaseline, MuiThemeProvider} from "@material-ui/core";
import {MuiPickersUtilsProvider} from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";
import {SnackbarProvider} from "notistack";
import {cyan} from "./themes";
import {LoadingCurrentUserProgressIndicator} from "./Authorization";
import {useLocalization} from "./store/hooks";
import {observer} from "mobx-react";

const {MobxRouter} = require("mobx-router");

export const App: FunctionComponent = observer(() => {
    const {dateFnsLocale} = useLocalization();

    return (
        <MuiPickersUtilsProvider utils={DateFnsUtils}
                                 locale={dateFnsLocale}
        >
            <SnackbarProvider maxSnack={3}>
                <MuiThemeProvider theme={cyan}>
                    <LoadingCurrentUserProgressIndicator/>
                    <CssBaseline/>
                    <MobxRouter/>
                </MuiThemeProvider>
            </SnackbarProvider>
        </MuiPickersUtilsProvider>
    )
});
