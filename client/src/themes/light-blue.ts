import {createTheme, darken, PaletteOptions} from "@mui/material";
import {createStyleOverride} from "./common";

const PRIMARY_MAIN = "rgb(3, 155, 229)";

const palette: PaletteOptions = {
    primary: {
        light: "rgb(174, 221, 245)",
        main: PRIMARY_MAIN,
        dark: darken(PRIMARY_MAIN, 0.7)
    },
    secondary: {
        main: "rgb(216, 27, 96)"
    }
};

export const lightBlue = createTheme({
    colorSchemes: {
        dark: {
            palette
        },
        light: {
            palette
        }
    },
    components: createStyleOverride(PRIMARY_MAIN)
});
