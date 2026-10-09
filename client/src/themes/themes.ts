import {Theme} from "@mui/material";
import {cyan} from "./cyan";
import {darkBlue} from "./dark-blue";
import {lightBlue} from "./light-blue";
import {purple} from "./purple";
import {red} from "./red";

export type Themes = "cyan" | "darkBlue" | "lightBlue" | "purple" | "red";

type ThemesMap = {
    [ThemeName in Themes]: Theme
}

export const themes: ThemesMap = {
    cyan,
    darkBlue,
    lightBlue,
    purple,
    red
};
