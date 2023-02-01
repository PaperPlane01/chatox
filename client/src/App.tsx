import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {CssBaseline, StyledEngineProvider, ThemeProvider} from "@mui/material";
import {LocalizationProvider} from "@mui/x-date-pickers";
import {AdapterDateFns} from "@mui/x-date-pickers/AdapterDateFns";
import {Helmet, HelmetProvider} from "react-helmet-async";
import rgbToHex from "rgb-hex";
import "yet-another-react-lightbox/dist/styles.css";
import {SnackbarProvider} from "notistack";
import {MobxRouter} from "mobx-router";
import {themes} from "./themes";
import {LoadingCurrentUserProgressIndicator} from "./Authorization";
import {useLocalization, rootStore, useStore} from "./store";
import {AudioPlayerContainer} from "./AudioPlayer";
import {ErrorBoundary} from "./ErrorBoundary";
import {AnonymousRegistrationDialog} from "./Registration";
import {SnackbarManager} from "./Snackbar";

export const App: FunctionComponent = observer(() => {
    const {dateFnsLocale} = useLocalization();
    const {
        theme: {
            currentTheme
        }
    } = useStore();
    const theme = themes[currentTheme];
    const headerColor = theme.palette.primary.main.startsWith("#")
        ? theme.palette.primary.main
        : `#${rgbToHex(theme.palette.primary.main)}`;

    return (
        <ErrorBoundary>
           <HelmetProvider>
               <LocalizationProvider dateAdapter={AdapterDateFns}
                                     adapterLocale={dateFnsLocale}
               >
                   <Helmet>
                       <meta name="theme-color" content={headerColor}/>
                   </Helmet>
                   <SnackbarProvider maxSnack={3}>
                       <StyledEngineProvider injectFirst>
                           <ThemeProvider theme={theme}>
                               <LoadingCurrentUserProgressIndicator/>
                               <CssBaseline/>
                               <MobxRouter store={rootStore}/>
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
