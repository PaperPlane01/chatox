import {ChatWithCreatorIdEntity} from "../types";

import {AbstractEntityStore} from "../../entity-store";
import {ChatWithCreatorId} from "../../api/types/response";

export class ReportedChatsStore extends AbstractEntityStore<ChatWithCreatorIdEntity, ChatWithCreatorId> {
    protected convertToNormalizedForm(denormalizedEntity: ChatWithCreatorId): ChatWithCreatorIdEntity {
        return {
            id: denormalizedEntity.id,
            avatarId: denormalizedEntity.avatar ? denormalizedEntity.avatar.id : undefined,
            createdAt: new Date(denormalizedEntity.createdAt),
            createdById: denormalizedEntity.createdById,
            description: denormalizedEntity.description,
            name: denormalizedEntity.name,
            slug: denormalizedEntity.slug,
            tags: denormalizedEntity.tags
        }
    }
}
