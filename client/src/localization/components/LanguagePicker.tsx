import React, {FunctionComponent} from "react";
import {inject, observer} from "mobx-react";
import {Card, CardContent, CardHeader, FormControl, FormControlLabel, Radio, RadioGroup} from "@material-ui/core";
import {localized, Localized} from "./localized";
import {Language} from "../types";
import {LanguageLabel} from "./LanguageLabel";
import {MapMobxToProps} from "../../store";

interface LanguagePickerOwnProps {
    hideHeader?: boolean
}

interface LanguagePickerMobxProps {
    setLanguage: (language: Language) => void
}

type LanguagePickerProps = LanguagePickerOwnProps & LanguagePickerMobxProps & Localized;

const _LanguagePicker: FunctionComponent<LanguagePickerProps> = ({
    hideHeader = false,
    setLanguage,
    locale,
    l
}) => (
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
);

const mapMobxToProps: MapMobxToProps<LanguagePickerMobxProps> = ({language}) => ({
    setLanguage: language.setLanguage
});

export const LanguagePicker = localized(
    inject(mapMobxToProps)(observer(_LanguagePicker))
) as FunctionComponent<LanguagePickerOwnProps>;
