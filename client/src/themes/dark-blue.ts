import {createTheme} from "@mui/material";
import {createStyleOverride} from "./common";

const PRIMARY_MAIN = "#303f9f";

export const darkBlue = createTheme({
    palette: {
        mode: "light",
        primary: {
            light: "#8997ff",
            main: PRIMARY_MAIN
        },
        secondary: {
            main: "#d81b60"
        }
    },
    components: createStyleOverride(PRIMARY_MAIN)
});