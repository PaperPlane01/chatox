import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {CssBaseline, StyledEngineProvider, ThemeProvider} from "@mui/material";
import {LocalizationProvider} from "@mui/x-date-pickers";
import {AdapterDateFns} from "@mui/x-date-pickers/AdapterDateFns";
import {Helmet, HelmetProvider} from "react-helmet-async";
import rgbToHex from "rgb-hex";
import "yet-another-react-lightbox/styles.css";
import {SnackbarProvider} from "notistack";
import {MobxRouter} from "mobx-router";
import {themes} from "./themes";
import {LoadingCurrentUserProgressIndicator} from "./Authorization/components";
import {useLocalization, useStore} from "./store/hooks";
import {rootStore} from "./store/root-store";
import {AudioPlayerContainer} from "./AudioPlayer/components";
import {ErrorBoundary} from "./ErrorBoundary/components";
import {AnonymousRegistrationDialog} from "./Registration/components";
import {SnackbarManager} from "./Snackbar/components";
import {useTitle} from "./utils/hooks";

export const App: FunctionComponent = observer(() => {
    const {dateFnsLocale} = useLocalization();
    const {
        theme: {
            currentTheme
        }
    } = useStore();
    const title = useTitle();
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
                       <title>{title}</title>
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
