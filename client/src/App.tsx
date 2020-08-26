import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {CssBaseline, MuiThemeProvider} from "@material-ui/core";
import {MuiPickersUtilsProvider} from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";
import {Helmet} from "react-helmet";
import rgbToHex from "rgb-hex";
import {SnackbarProvider} from "notistack";
import {cyan} from "./themes";
import {LoadingCurrentUserProgressIndicator} from "./Authorization";
import {useLocalization} from "./store/hooks";

const {MobxRouter} = require("mobx-router");

export const App: FunctionComponent = observer(() => {
    const {dateFnsLocale} = useLocalization();

    console.log(rgbToHex(cyan.palette.primary.main));

    return (
        <MuiPickersUtilsProvider utils={DateFnsUtils}
                                 locale={dateFnsLocale}
        >
            <Helmet>
                <meta name="theme-color" content={`#${rgbToHex(cyan.palette.primary.main)}`}/>
            </Helmet>
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
