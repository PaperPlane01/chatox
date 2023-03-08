import {Themes} from "../../themes";
import {makeAutoObservable} from "mobx";

const ALLOWED_THEMES: Themes[] = ["cyan", "darkBlue", "lightBlue", "red", "purple"];

export class ThemeStore {
    currentTheme: Themes = "cyan";

    constructor() {
        makeAutoObservable(this);

        if (localStorage) {
            const theme = localStorage.getItem("theme");

            if (theme && ALLOWED_THEMES.includes(theme as any)) {
                this.setCurrentTheme(theme as Themes);
            }
        }
    }

    setCurrentTheme = (theme: Themes): void => {
        this.currentTheme = theme;

        if (localStorage) {
            localStorage.setItem("theme", theme);
        }
    }
}