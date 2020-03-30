import React, {ComponentType, FunctionComponent} from "react";
import {inject, observer} from "mobx-react";
import {Labels, Language} from "../types";
import {replacePlaceholder} from "../utils";
import {IAppState} from "../../store";

export interface Localized {
    l: (label: keyof Labels, bindings?: any) => string,
    locale: Language
}

interface LocalizedMobxProps {
    currentLabels: Labels,
    locale: Language
}

const mapMobxToProps = (state: IAppState): LocalizedMobxProps => ({
    currentLabels: state.language.currentLanguageLabels,
    locale: state.language.selectedLanguage
});

export const localized = <T extends Localized>(
    WrappedComponent: ComponentType<T>
): FunctionComponent<T & LocalizedMobxProps> => {
    return inject(mapMobxToProps)(observer((props: T & LocalizedMobxProps) => {
        const {locale, currentLabels}  = props;
        const getLabel = (labelKey: keyof Labels, bindings?: any): string => {
            let label = currentLabels[labelKey];

            if (bindings) {
                label = replacePlaceholder(label, bindings);
            }

            return label;
        };

        return <WrappedComponent l={getLabel} locale={locale} {...props}/>
    }))
};
