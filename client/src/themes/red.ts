import {createTheme} from "@mui/material";
import {createStyleOverride} from "./common";

const PRIMARY_MAIN = "#ef5350";

export const red = createTheme({
    palette: {
        mode: 'light',
        primary: {
            light: "#ffbebb",
            main: PRIMARY_MAIN,
        },
        secondary: {
            main: '#5e35b1',
        }
    },
    components: createStyleOverride(PRIMARY_MAIN)
});