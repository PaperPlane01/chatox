import {ChatFeatures} from "../../api/types/response";

export interface ConvertableChatFeatureFormStore<Feature extends keyof ChatFeatures> {
    convertToApiRequest(): ChatFeatures[Feature]
}