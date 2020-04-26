import React, {ComponentType, FunctionComponent} from "react";
import {inject, observer} from "mobx-react";
import {Locale} from "date-fns";
import {Labels, Language, TranslationFunction} from "../types";
import {replacePlaceholder} from "../utils";
import {IAppState} from "../../store";

export interface Localized {
    l: TranslationFunction,
    locale: Language,
    dateFnsLocale: Locale
}

interface LocalizedMobxProps {
    currentLabels: Labels,
    locale: Language,
    dateFnsLocale: Locale
}

const mapMobxToProps = (state: IAppState): LocalizedMobxProps => ({
    currentLabels: state.language.currentLanguageLabels,
    locale: state.language.selectedLanguage,
    dateFnsLocale: state.language.currentDateFnsLocale
});

export const localized = <T extends Localized>(
    WrappedComponent: ComponentType<T>
): FunctionComponent<T & LocalizedMobxProps> => {
    return inject(mapMobxToProps)(observer((props: T & LocalizedMobxProps) => {
        const {locale, currentLabels, dateFnsLocale}  = props;

        const getLabel = (labelKey: keyof Labels, bindings?: any): string => {
            let label = currentLabels[labelKey];

            if (bindings) {
                label = replacePlaceholder(label, bindings);
            }

            return label;
        };

        return <WrappedComponent l={getLabel} locale={locale} dateFnsLocale={dateFnsLocale} {...props}/>
    }))
};
