import {ChatFeatureData} from "./ChatFeatureData";

export type LevelBasedChatFeatureData = ChatFeatureData<{
    fromLevel?: number,
    upToLevel?: number
}>;