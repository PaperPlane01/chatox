import {createTheme} from "@mui/material";
import {createStyleOverride} from "./common";

const PRIMARY_MAIN = "rgb(48, 63, 159)";

export const darkBlue = createTheme({
    palette: {
        mode: "light",
        primary: {
            light: "rgb(137, 151, 255)",
            main: PRIMARY_MAIN
        },
        secondary: {
            main: "rgb(216, 27, 96)"
        }
    },
    components: createStyleOverride(PRIMARY_MAIN)
});