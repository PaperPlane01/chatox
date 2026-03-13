import {createTheme} from "@mui/material";
import {createStyleOverride} from "./common";

const PRIMARY_MAIN = "rgb(239, 83, 80)";

export const red = createTheme({
    palette: {
        mode: "light",
        primary: {
            light: "rgb(255, 190, 187)",
            main: PRIMARY_MAIN
        },
        secondary: {
            main: "rgb(94, 53, 177)"
        }
    },
    components: createStyleOverride(PRIMARY_MAIN)
});