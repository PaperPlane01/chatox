import {createTheme, darken, PaletteOptions} from "@mui/material";
import {createStyleOverride} from "./common";

const PRIMARY_MAIN = "rgb(0, 131, 143, 1)";

const palette: PaletteOptions = {
    primary: {
        light: "rgb(71,247,255,0.19)",
        main: PRIMARY_MAIN,
        dark: darken(PRIMARY_MAIN, 0.7)
    },
    secondary: {
        light: "rgb(94, 146, 243, 1)",
        main: "rgb(21, 101, 192, 1)",
        dark: "rgb(0, 60, 143, 1)"
    },
    error: {
        light: "#e57373",
        main: "#f44336",
        dark: "#d32f2f"
    }
};

export const cyan = createTheme({
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
