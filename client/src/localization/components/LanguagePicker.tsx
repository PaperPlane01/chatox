import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Card, CardContent, CardHeader, FormControlLabel, Radio, RadioGroup} from "@mui/material";
import {Language} from "../types";
import {LanguageLabel} from "./LanguageLabel";
import {useLocalization, useStore} from "../../store";

interface LanguagePickerProps {
    hideHeader?: boolean
}

export const LanguagePicker: FunctionComponent<LanguagePickerProps> = observer(({
    hideHeader = false
}) => {
    const {
        language: {
            setLanguage
        }
    } = useStore();
    const {l, locale} = useLocalization();

    return (
        <Card>
            {!hideHeader && <CardHeader title={l("language.select-language")}/>}
            <CardContent>
                <RadioGroup value={locale}
                            onChange={event => setLanguage(event.target.value as Language)}
                >
                    <FormControlLabel control={<Radio/>}
                                      value="en"
                                      label={
                                          <LanguageLabel languageLabel={l("language.english")}
                                                         nativeLanguageLabel={l("language.english.native")}
                                          />
                                      }
                    />
                    <FormControlLabel control={<Radio/>}
                                      value="ru"
                                      label={
                                          <LanguageLabel languageLabel={l("language.russian")}
                                                         nativeLanguageLabel={l("language.russian.native")}
                                          />
                                      }
                    />
                </RadioGroup>
            </CardContent>
        </Card>
    )
});
