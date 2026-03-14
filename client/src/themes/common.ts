import {Components, unstable_createBreakpoints} from "@mui/material";

const breakPoints = unstable_createBreakpoints({});

export const createStyleOverride = (mainColor: string): Components => ({
    MuiCssBaseline: {
        styleOverrides: {
            "em-emoji-picker": {
                "--rgb-accent": mainColor
                    .replace("rgb", "")
                    .replace("(", "")
                    .replace(")", ""),
                [breakPoints.down("lg")]: {
                    width: "100%",
                }
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