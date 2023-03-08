import {useTheme} from "@mui/material";

export type Luminosity = "bright" | "light" | "dark" | "random";

export interface UseLuminosityOptions {
    darkTheme?: Luminosity,
    lightTheme?: Luminosity
}

const DEFAULT_OPTIONS: Required<UseLuminosityOptions> = {
    darkTheme: "light",
    lightTheme: "dark"
}

export const useLuminosity = (options: UseLuminosityOptions = DEFAULT_OPTIONS): Luminosity => {
    const theme = useTheme();

    if (theme.palette.mode === "light") {
        return options.lightTheme ? options.lightTheme : DEFAULT_OPTIONS.lightTheme;
    } else {
        return options.darkTheme ? options.darkTheme : DEFAULT_OPTIONS.darkTheme;
    }
}
