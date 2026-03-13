import {Components} from "@mui/material";

export const createStyleOverride = (mainColor: string): Components => ({
    MuiCssBaseline: {
        styleOverrides: {
            "em-emoji-picker": {
                "--rgb-accent": mainColor
                    .replace("rgb", "")
                    .replace("(", "")
                    .replace(")", ""),
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