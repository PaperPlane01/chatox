import {createTheme, darken, PaletteOptions} from "@mui/material";
import {createStyleOverride} from "./common";

const PRIMARY_MAIN = "rgb(48, 63, 159)";

const palette: PaletteOptions = {
    primary: {
        light: "rgb(137, 151, 255)",
        main: PRIMARY_MAIN,
        dark: darken(PRIMARY_MAIN, 0.7)
    },
    secondary: {
        main: "rgb(216, 27, 96)"
    }
};

export const darkBlue = createTheme({
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
