import {Labels} from "../../localization/types";

export interface TagErrorsMap {
    [tag: string]: keyof Labels| undefined
}

export interface TagErrorsMapContainer {
    tagErrorsMap: TagErrorsMap
}
