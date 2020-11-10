import {createContext} from "react";
import {computed} from "mobx";
import {store} from "../store";
import {IAppState} from "../IAppState";
import {Labels, Language} from "../../localization/types";
import {replacePlaceholder} from "../../localization/utils";

class LocalizationContext {
    @computed
    get locale(): Language {
        return this.store.language.selectedLanguage;
    }

    @computed
    get dateFnsLocale(): Locale {
        return this.store.language.currentDateFnsLocale;
    }

    constructor(private readonly store: IAppState) {}

    l = (labelKey: keyof Labels, bindings?: any): string => {
        let label = this.store.language.currentLanguageLabels[labelKey];

        if (bindings) {
            label = replacePlaceholder(label, bindings);
        }

        return label;
    }
}

export const localizationContext = createContext(new LocalizationContext(store));
