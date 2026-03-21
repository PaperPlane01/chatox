import {createTheme} from "@mui/material";
import {createStyleOverride} from "./common";

const PRIMARY_MAIN = "rgb(3, 155, 229)";

export const lightBlue = createTheme({
    palette: {
        mode: "light",
        primary: {
            light: "rgb(174, 221, 245)",
            main: PRIMARY_MAIN
        },
        secondary: {
            main: "rgb(216, 27, 96)"
        }
    },
    components: createStyleOverride(PRIMARY_MAIN)
});