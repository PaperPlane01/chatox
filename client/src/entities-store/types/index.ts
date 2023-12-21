import {MessageEntity} from "../../Message/types";
import {ChatOfCurrentUserEntity, ChatUploadEntity} from "../../Chat";
import {ChatParticipationEntity} from "../../ChatParticipant";
import {UserEntity, UserProfilePhotoEntity} from "../../User";
import {ChatBlockingEntity} from "../../ChatBlocking";
import {Upload} from "../../api/types/response";
import {GlobalBanEntity} from "../../GlobalBan/types";
import {ChatWithCreatorIdEntity, ReportEntity} from "../../Report/types";
import {StickerEntity, StickerPackEntity} from "../../Sticker";
import {ChatRoleEntity} from "../../ChatRole/types";
import {RequiredField} from "../../utils/types";
import {RewardEntity, UserRewardEntity} from "../../Reward/types";
import {UserInteractionEntity} from "../../UserInteraction/types";
import {ChatInviteEntity} from "../../ChatInvite/types";

export type Entities = "messages"
    | "chats"
    | "users"
    | "chatParticipations"
    | "chatBlockings"
    | "uploads"
    | "chatUploads"
    | "globalBans"
    | "scheduledMessages"
    | "reports"
    | "reportedMessages"
    | "reportedMessageSenders"
    | "reportedUsers"
    | "reportedChats"
    | "stickers"
    | "stickerPacks"
    | "chatRoles"
    | "rewards"
    | "userRewards"
    | "userInteractions"
    | "userProfilePhotos"
    | "chatInvites";

interface EntityMap<T> {
    [key: string]: T
}

//@formatter:off
export type GetEntityType<Key extends Entities>
    = Key extends "messages" ? MessageEntity
    : Key extends "chats" ? ChatOfCurrentUserEntity
    : Key extends "users" ? UserEntity
    : Key extends "chatParticipations" ? ChatParticipationEntity
    : Key extends "chatBlockings" ? ChatBlockingEntity
    : Key extends "uploads" ? Upload<any>
    : Key extends "chatUploads" ? ChatUploadEntity
    : Key extends "globalBans" ? GlobalBanEntity
    : Key extends "scheduledMessages" ? MessageEntity
    : Key extends "reports" ? ReportEntity
    : Key extends "reportedMessages" ? MessageEntity
    : Key extends "reportedMessageSenders" ? UserEntity
    : Key extends "reportedUsers" ? UserEntity
    : Key extends "reportedChats" ? ChatWithCreatorIdEntity
    : Key extends "stickers" ? StickerEntity
    : Key extends "stickerPacks" ? StickerPackEntity
    : Key extends "chatRoles" ? ChatRoleEntity
    : Key extends "rewards" ? RewardEntity
    : Key extends "userRewards" ? UserRewardEntity
    : Key extends "userInteractions" ? UserInteractionEntity
    : Key extends "userProfilePhotos" ? UserProfilePhotoEntity
    : Key extends "chatInvites" ? ChatInviteEntity
    : never;
//@formatter:on

type GetEntityMapType<Key extends Entities> = EntityMap<GetEntityType<Key>>;

export type RawEntities = {
    [Key in Entities]: GetEntityMapType<Key>
};

export type RawEntityKey = Entities & keyof RawEntities;

export type EntitiesIds = {
    [Key in Entities]: string[]
};

export type EntitiesPatch = {
    entities: Partial<RawEntities>,
    ids: Partial<EntitiesIds>
};

export type PopulatedEntitiesPatch<T extends Entities> = {
    entities: RequiredField<Partial<RawEntities>, T>,
    ids: RequiredField<Partial<EntitiesIds>, T>
};