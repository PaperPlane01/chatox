import {createTheme} from "@mui/material";
import {createStyleOverride} from "./common";

const PRIMARY_MAIN = "#8e24aa";

export const purple = createTheme({
    palette: {
        mode: "light",
        primary: {
            light: "#d6abfc",
            main: PRIMARY_MAIN,
        },
        secondary: {
            main: "#5c6bc0",
        }
    },
    components: createStyleOverride(PRIMARY_MAIN)
});