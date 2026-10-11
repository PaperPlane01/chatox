import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {
    Card,
    CardContent,
    CardHeader,
    FormControl,
    FormControlLabel,
    PaletteMode,
    Radio,
    RadioGroup,
    useColorScheme
} from "@mui/material";
import {useLocalization} from "../../store/hooks";
import {Labels} from "../../localization";

type ColorScheme = PaletteMode | "system";
const COLOR_SCHEMES: ColorScheme[] = ["system", "light", "dark"];

const getColorSchemeLabel = (colorScheme: string): keyof Labels => `settings.color-scheme.${colorScheme}` as keyof Labels;

export const ColorSchemePicker: FunctionComponent = observer(() => {
    const {l} = useLocalization();
    const {mode, setMode} = useColorScheme();

    return (
        <Card>
            <CardHeader title={l("settings.color-scheme")}/>
            <CardContent>
                <FormControl>
                    <RadioGroup
                        value={mode ?? "system"}
                        onChange={event => setMode(event.target.value as ColorScheme)}
                    >
                        {COLOR_SCHEMES.map(colorScheme => (
                            <FormControlLabel
                                key={colorScheme}
                                value={colorScheme}
                                control={<Radio/>}
                                label={l(getColorSchemeLabel(colorScheme))}
                            />
                        ))}
                    </RadioGroup>
                </FormControl>
            </CardContent>
        </Card>
    );
});
