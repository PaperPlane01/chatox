import {type ObservableMap} from "mobx";
import {MessageEntity} from "../../Message";
import {ChatOfCurrentUserEntity, ChatUploadEntity} from "../../Chat";
import {ChatParticipationEntity, PendingChatParticipationEntity} from "../../ChatParticipant";
import {UserEntity, UserProfilePhotoEntity} from "../../User";
import {ChatBlockingEntity} from "../../ChatBlocking";
import {Upload} from "../../api/types/response";
import {GlobalBanEntity} from "../../GlobalBan/types";
import {ChatWithCreatorIdEntity, ReportEntity} from "../../Report/types";
import {StickerAnimationData, StickerEntity, StickerPackEntity} from "../../Sticker";
import {ChatRoleEntity} from "../../ChatRole/types";
import {RequiredField} from "../../utils/types";
import {RewardEntity, UserRewardEntity} from "../../Reward/types";
import {UserInteractionEntity} from "../../UserInteraction/types";
import {ChatInviteEntity} from "../../ChatInvite/types";
import {MessageReactionEntity} from "../../MessageReaction/types";
import {BaseEntity} from "../../entity-store";

export interface RawEntities {
    messages: ObservableMap<string, MessageEntity>,
    chats: ObservableMap<string, ChatOfCurrentUserEntity>,
    users: ObservableMap<string, UserEntity>,
    chatParticipations: ObservableMap<string, ChatParticipationEntity>,
    chatBlockings: ObservableMap<string, ChatBlockingEntity>,
    uploads: ObservableMap<string, Upload<any>>,
    chatUploads: ObservableMap<string, ChatUploadEntity>,
    globalBans: ObservableMap<string, GlobalBanEntity>,
    scheduledMessages: ObservableMap<string, MessageEntity>,
    reports: ObservableMap<string, ReportEntity>,
    reportedMessages: ObservableMap<string, MessageEntity>,
    reportedMessageSenders: ObservableMap<string, UserEntity>,
    reportedUsers: ObservableMap<string, UserEntity>,
    reportedChats: ObservableMap<string, ChatWithCreatorIdEntity>,
    stickers: ObservableMap<string, StickerEntity>,
    stickerPacks: ObservableMap<string, StickerPackEntity>,
    chatRoles: ObservableMap<string, ChatRoleEntity>,
    rewards: ObservableMap<string, RewardEntity>,
    userRewards: ObservableMap<string, UserRewardEntity>,
    userInteractions: ObservableMap<string, UserInteractionEntity>,
    userProfilePhotos: ObservableMap<string, UserProfilePhotoEntity>,
    chatInvites: ObservableMap<string, ChatInviteEntity>,
    pendingChatParticipations: ObservableMap<string, PendingChatParticipationEntity>,
    draftMessages: ObservableMap<string, MessageEntity>,
    stickerAnimationData: ObservableMap<string, StickerAnimationData>,
    messageReactions: ObservableMap<string, MessageReactionEntity>
}

export type Entities = keyof RawEntities;

export type PersistentEntities = Extract<Entities, "messages" | "users" | "uploads" | "stickers" | "stickerPacks" | "chatRoles" | "draftMessages" | "stickerAnimationData" | "messageReactions">;

export type GetEntityType<Key extends Entities> = RawEntities[Key] extends ObservableMap<string, infer Entity extends BaseEntity>
    ? Entity
    : never;

export type EntitiesPatch = {
    entities: Partial<{
        [Key in Entities]: Map<string, GetEntityType<Key>>
    }>
};

export type PopulatedEntitiesPatch<T extends Entities> = {
    entities: RequiredField<EntitiesPatch["entities"], T>
};

export type RelationshipsIds = {
    [key in Entities]?: string[]
};
