import {Labels, TranslationFunction} from "../../localization";

export const getForwardMessagesLabel = (count: number | undefined, l: TranslationFunction): string => {
    const [label, bindings]: readonly [keyof Labels, object | undefined] = count && count > 1
        ? ["message.forward.count", {count}]
        : ["message.forward", undefined];
    return l(label, bindings);
};