import {createTransformer} from "mobx-utils";
import {mergeWith} from "lodash";
import {ChatRoleEntity} from "../types";
import {AbstractEntityStore} from "../../entity-store";
import {EntitiesPatch} from "../../entities-store";
import {ChatRole} from "../../api/types/response";
import {mergeCustomizer} from "../../utils/object-utils";

export class ChatRolesStore extends AbstractEntityStore<"chatRoles", ChatRoleEntity, ChatRole> {

    findAllByChat = createTransformer((chatId: string): ChatRoleEntity[] => {
        return this.findAll().filter(chatRole => chatRole.chatId === chatId);
    })

    createPatchForArray(denormalizedEntities: ChatRole[], options: {} | undefined): EntitiesPatch {
        const patch = this.createEmptyEntitiesPatch("chatRoles", "users");
        const patches: EntitiesPatch[] = [];

        denormalizedEntities.forEach(chatRole => {
            const entity = this.convertToNormalizedForm(chatRole);
            patch.entities.chatRoles[entity.id] = entity;
            patch.ids.chatRoles.push(entity.id);

            if (chatRole.createdBy) {
                patches.push(this.entities.users.createPatch(chatRole.createdBy));
            }

            if (chatRole.updatedBy) {
                patches.push(this.entities.users.createPatch(chatRole.updatedBy));
            }
        });

        return mergeWith(patch, ...patches, mergeCustomizer);
    }

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
        };
    }
}