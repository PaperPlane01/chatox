import {MessageEntity} from "../../Message/types";
import {ChatOfCurrentUserEntity, ChatParticipationEntity, ChatUploadEntity} from "../../Chat";
import {UserEntity} from "../../User";
import {ChatBlockingEntity} from "../../ChatBlocking";
import {Upload} from "../../api/types/response";
import {GlobalBanEntity} from "../../GlobalBan/types";
import {ReportEntity} from "../../Report/types";
import {StickerEntity, StickerPackEntity} from "../../Sticker";
import {ChatRoleEntity} from "../../ChatRole/types";
import {RequiredField} from "../../utils/types";

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
    | "reportedMessagesSenders"
    | "reportedUsers"
    | "reportedChats"
    | "stickers"
    | "stickerPacks"
    | "chatRoles";

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
    : Key extends "reportedMessagesSenders" ? UserEntity
    : Key extends "reportedUsers" ? UserEntity
    : Key extends "reportedChats" ? ChatOfCurrentUserEntity
    : Key extends "stickers" ? StickerEntity
    : Key extends "stickerPacks" ? StickerPackEntity
    : Key extends "chatRoles" ? ChatRoleEntity
    : never;
//@formatter:on

type GetEntityMapType<Key extends Entities> = EntityMap<GetEntityType<Key>>;

export type RawEntities = {
    [Key in Entities]: GetEntityMapType<Key>
};

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
}