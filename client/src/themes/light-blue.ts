import {createTheme} from "@mui/material";
import {createStyleOverride} from "./common";

const PRIMARY_MAIN = "#039be5";

export const lightBlue = createTheme({
    palette: {
        mode: "light",
        primary: {
            light: "#aeddf5",
            main: PRIMARY_MAIN
        },
        secondary: {
            main: "#d81b60"
        }
    },
    components: createStyleOverride(PRIMARY_MAIN)
});