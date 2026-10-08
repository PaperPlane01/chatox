import {createTheme, darken, PaletteOptions} from "@mui/material";
import {createStyleOverride} from "./common";

const PRIMARY_MAIN = "rgb(142, 36, 170)";

const palette: PaletteOptions = {
    primary: {
        light: "#d6abfc",
        main: PRIMARY_MAIN,
        dark: darken(PRIMARY_MAIN, 0.7)
    },
    secondary: {
        main: "#5c6bc0",
    }
};

export const purple = createTheme({
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
