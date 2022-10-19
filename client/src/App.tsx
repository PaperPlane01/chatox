import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {CssBaseline, StyledEngineProvider, ThemeProvider} from "@mui/material";
import {LocalizationProvider} from "@mui/x-date-pickers";
import {AdapterDateFns} from "@mui/x-date-pickers/AdapterDateFns";
import {Helmet, HelmetProvider} from "react-helmet-async";
import rgbToHex from "rgb-hex";
import "yet-another-react-lightbox/dist/styles.css";
import {SnackbarProvider} from "notistack";
import {cyan} from "./themes";
import {LoadingCurrentUserProgressIndicator} from "./Authorization";
import {useLocalization} from "./store";
import {AudioPlayerContainer} from "./AudioPlayer";
import {ErrorBoundary} from "./ErrorBoundary";
import {AnonymousRegistrationDialog} from "./Registration";
import {SnackbarManager} from "./Snackbar";

const {MobxRouter} = require("mobx-router");

export const App: FunctionComponent = observer(() => {
    const {dateFnsLocale} = useLocalization();

    return (
        <ErrorBoundary>
           <HelmetProvider>
               <LocalizationProvider dateAdapter={AdapterDateFns}
                                     adapterLocale={dateFnsLocale}
               >
                   <Helmet>
                       <meta name="theme-color" content={`#${rgbToHex(cyan.palette.primary.main)}`}/>
                   </Helmet>
                   <SnackbarProvider maxSnack={3}>
                       <StyledEngineProvider injectFirst>
                           <ThemeProvider theme={cyan}>
                               <LoadingCurrentUserProgressIndicator/>
                               <CssBaseline/>
                               <MobxRouter/>
                               <AudioPlayerContainer/>
                               <AnonymousRegistrationDialog/>
                               <SnackbarManager/>
                           </ThemeProvider>
                       </StyledEngineProvider>
                   </SnackbarProvider>
               </LocalizationProvider>
           </HelmetProvider>
        </ErrorBoundary>
    );
});
