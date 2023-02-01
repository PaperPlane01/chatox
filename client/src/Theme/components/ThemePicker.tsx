import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {FormControl, FormControlLabel, RadioGroup, Radio, Card, CardHeader, CardContent} from "@mui/material";
import {useStore, useLocalization} from "../../store";
import {Themes, themes} from "../../themes";
import {Labels} from "../../localization";

const getThemeLabel = (theme: string): keyof Labels => `theme.${theme}` as keyof Labels;

export const ThemePicker: FunctionComponent = observer(() => {
    const {
        theme: {
            currentTheme,
            setCurrentTheme
        }
    } = useStore();
    const {l} = useLocalization();

    return (
        <Card>
            <CardHeader title={l("theme")}/>
            <CardContent>
                <FormControl>
                    <RadioGroup value={currentTheme}
                                onChange={event => setCurrentTheme(event.target.value as Themes)}
                    >
                        {Object.keys(themes).map(theme => (
                            <FormControlLabel value={theme}
                                              control={(
                                                  <Radio sx={{
                                                      color: themes[theme as Themes].palette.primary.main
                                                  }}/>
                                              )}
                                              label={l(getThemeLabel(theme))}
                            />
                        ))}
                    </RadioGroup>
                </FormControl>
            </CardContent>
        </Card>
    );
});
