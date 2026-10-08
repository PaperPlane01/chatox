import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Switch, useColorScheme, useMediaQuery, FormControlLabel} from "@mui/material";
import {useLocalization} from "../../store/hooks";

export const DarkModeSwitch: FunctionComponent = observer(() => {
    const {l} = useLocalization();
    const {mode, setMode} = useColorScheme();
    const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
    const darkModeActive = mode === "dark" || prefersDarkMode;

    const handleToggle = (): void => {
        if (!darkModeActive) {
            setMode("dark");
        } else {
            setMode("light");
        }
    };

    return (
        <FormControlLabel
            control={(
                <Switch
                    checked={darkModeActive}
                    onChange={handleToggle}
                />
            )}
            label={l("settings.dark-mode")}
        />
    );
});
