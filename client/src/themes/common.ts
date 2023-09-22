import {Components} from "@mui/material";

export const createStyleOverride = (mainColor: string): Components => ({
    MuiCssBaseline: {
        styleOverrides: {
            ".emoji-mart-anchor-bar": {
                backgroundColor: `${mainColor} !important`
            },
            ".emoji-mart-anchor-selected": {
                color: `${mainColor} !important`
            },
            ".yarl__portal": {
                zIndex: "1350 !important"
            }
        }
    },
    MuiUseMediaQuery: {
        defaultProps: {
            noSsr: true
        }
    }
});