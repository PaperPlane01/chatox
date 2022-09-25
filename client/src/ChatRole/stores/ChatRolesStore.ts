import {createTransformer} from "mobx-utils";
import {ChatRoleEntity} from "../types";
import {AbstractEntityStore} from "../../entity-store";
import {ChatRole} from "../../api/types/response";

export class ChatRolesStore extends AbstractEntityStore<ChatRoleEntity, ChatRole> {
    public findAllByChat = createTransformer((chatId: string): ChatRoleEntity[] => {
        return this.findAll().filter(role => role.chatId === chatId);
    })

    protected convertToNormalizedForm(denormalizedEntity: ChatRole): ChatRoleEntity {
        return {
            id: denormalizedEntity.id,
            chatId: denormalizedEntity.chatId,
            createdAt: new Date(denormalizedEntity.createdAt),
            createdById: denormalizedEntity.createdBy?.id,
            default: denormalizedEntity.default,
            features: denormalizedEntity.features,
            level: denormalizedEntity.level,
            name: denormalizedEntity.name,
            updatedAt: denormalizedEntity.updatedAt ? new Date(denormalizedEntity.updatedAt) : undefined,
            updatedById: denormalizedEntity.updatedBy?.id
        }
    }
}