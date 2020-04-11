import {Labels} from "./Labels";

export type TranslationFunction = (label: keyof Labels, bindings?: any) => string;
