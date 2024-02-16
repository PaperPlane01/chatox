import { observable, action, computed, makeObservable } from "mobx";
import {computedFn} from "mobx-utils";
import {Locale} from "date-fns";
import enDateFnsLocale from "date-fns/locale/en-US";
import ruDateFnsLocale from "date-fns/locale/ru";
import {en, ru} from "../translations";
import {Labels, Language} from "../types";
import {replacePlaceholder} from "../utils";

export class LocaleStore {
    selectedLanguage: Language = localStorage && ["en", "ru"].includes(localStorage.getItem("language") || "")
        ? localStorage.getItem("language") as Language
        : "en";

    labels = {ru, en};

    dateFnsLocales = {
        en: enDateFnsLocale,
        ru: ruDateFnsLocale
    };

    constructor() {
        makeObservable(this, {
            selectedLanguage: observable,
            labels: observable,
            dateFnsLocales: observable,
            currentLanguageLabels: computed,
            currentDateFnsLocale: computed,
            setLanguage: action
        });
    }

    get currentLanguageLabels(): Labels {
        return this.labels[this.selectedLanguage];
    }

    get currentDateFnsLocale(): Locale {
        return this.dateFnsLocales[this.selectedLanguage];
    }

    setLanguage = (language: Language): void => {
        localStorage.setItem("language", language);
        this.selectedLanguage = language;
    }

    getCurrentLanguageLabel = computedFn((labelKey: keyof Labels, bindings?: any): string => {
        let label = this.currentLanguageLabels[labelKey];

        if (bindings) {
            label = replacePlaceholder(label, bindings);
        }

        return label;
    })
}
