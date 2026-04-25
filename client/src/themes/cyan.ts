import {createTheme} from "@mui/material";
import {createStyleOverride} from "./common";

const PRIMARY_MAIN = "rgb(0, 131, 143, 1)";

export const cyan = createTheme({
    palette: {
        common: {
            black: "#000",
            white: "#fff"
        },
        background: {
            paper: "#fff",
            default: "#fafafa"
        },
        primary: {
            light: "rgb(71,247,255,0.19)",
            main: PRIMARY_MAIN,
            dark: "rgb(0, 86, 98, 1)",
            contrastText: "#fff"
        },
        secondary: {
            light: "rgb(94, 146, 243, 1)",
            main: "rgb(21, 101, 192, 1)",
            dark: "rgb(0, 60, 143, 1)",
            contrastText: "#fff"
        },
        error: {
            light: "#e57373",
            main: "#f44336",
            dark: "#d32f2f",
            contrastText: "#fff"
        },
        text: {
            primary: "rgb(0, 0, 0, 0.87)",
            secondary: "rgb(0, 0, 0, 0.54)",
            disabled: "rgb(0, 0, 0, 0.38)"
        }
    },
    components: createStyleOverride(PRIMARY_MAIN)
});
