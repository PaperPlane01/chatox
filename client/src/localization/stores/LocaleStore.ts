import {observable, action, computed} from "mobx";
import {Locale} from "date-fns";
import enDateFnsLocale from "date-fns/locale/en-US";
import ruDateFnsLocale from "date-fns/locale/ru";
import {en, ru} from "../translations";
import {Labels, Language} from "../types";

export class LocaleStore {
    @observable
    selectedLanguage: Language = localStorage.getItem("language") !== null
        && (localStorage.getItem("language") === "en" || localStorage.getItem("language") === "ru")
        ? localStorage.getItem("language") as Language
        : "en";

    @observable
    labels = {ru, en};

    @observable
    dateFnsLocales = {
        en: enDateFnsLocale,
        ru: ruDateFnsLocale
    };

    @computed
    get currentLanguageLabels(): Labels {
        return this.labels[this.selectedLanguage];
    }

    @computed
    get currentDateFnsLocale(): Locale {
        return this.dateFnsLocales[this.selectedLanguage];
    }

    @action
    setLanguage = (language: Language): void => {
        localStorage.setItem("language", language);
        this.selectedLanguage = language;
    }
}
