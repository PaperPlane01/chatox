import {SendMessagesFeatureData} from "./SendMessagesFeatureData";
import {BlockUsersFeatureData} from "./BlockUsersFeatureData";
import {ChatFeatureData} from "./ChatFeatureData";
import {LevelBasedChatFeatureData} from "./LevelBasedChatFeatureData";

export interface ChatFeatures {
    sendMessages: SendMessagesFeatureData,
    blockUsers: BlockUsersFeatureData,
    kickUsers: ChatFeatureData,
    deleteOwnMessages: ChatFeatureData,
    deleteOtherUsersMessages: LevelBasedChatFeatureData,
    scheduleMessages: ChatFeatureData,
    deleteChat: ChatFeatureData,
    changeChatSettings: ChatFeatureData,
    modifyChatRoles: ChatFeatureData,
    assignChatRole: LevelBasedChatFeatureData,
    kickImmunity: LevelBasedChatFeatureData,
    blockingImmunity: LevelBasedChatFeatureData,
    messageDeletionsImmunity: LevelBasedChatFeatureData,
    showRoleNameInMessages: ChatFeatureData,
    pinMessages: ChatFeatureData,
    manageInvites: ChatFeatureData
}