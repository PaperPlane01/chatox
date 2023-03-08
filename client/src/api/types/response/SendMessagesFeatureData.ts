import {ChatFeatureData} from "./ChatFeatureData";

export type SendMessagesFeatureData = ChatFeatureData<{
    allowedToSendAudios: boolean,
    allowedToSendFiles: boolean,
    allowedToSendImages: boolean,
    allowedToSendStickers: boolean,
    allowedToSendVideos: boolean,
    allowedToSendVoiceMessages: boolean
}>;