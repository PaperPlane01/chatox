import {createTheme, darken, PaletteOptions} from "@mui/material";
import {createStyleOverride} from "./common";

const PRIMARY_MAIN = "rgb(239, 83, 80)";

const palette: PaletteOptions = {
    primary: {
        light: "rgb(255, 190, 187)",
        main: PRIMARY_MAIN,
        dark: darken(PRIMARY_MAIN, 0.7)
    },
    secondary: {
        main: "rgb(94, 53, 177)"
    }
};

export const red = createTheme({
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
