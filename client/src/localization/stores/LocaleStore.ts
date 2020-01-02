import {observable, action, computed} from "mobx";
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

    @computed
    get currentLanguageLabels(): Labels {
        return this.labels[this.selectedLanguage];
    }

    @action
    setLanguage = (language: Language): void => {
        localStorage.setItem("language", language);
        this.selectedLanguage = language;
    }
}
