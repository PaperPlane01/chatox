import {mergeWith} from "lodash";
import {ChatWithCreatorIdEntity} from "../types";
import {AbstractEntityStore} from "../../entity-store";
import {EntitiesPatch} from "../../entities-store";
import {ChatWithCreatorId} from "../../api/types/response";
import {mergeCustomizer} from "../../utils/object-utils";

export class ReportedChatsStore extends AbstractEntityStore<"reportedChats", ChatWithCreatorIdEntity, ChatWithCreatorId> {
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

    createPatchForArray(denormalizedEntities: ChatWithCreatorId[], options: {} | undefined): EntitiesPatch {
        const patch = this.createEmptyEntitiesPatch("reportedChats");
        const patches: EntitiesPatch[] = [];

        denormalizedEntities.forEach(reportedChat => {
            const entity = this.convertToNormalizedForm(reportedChat);
            patch.entities.reportedChats[reportedChat.id] = entity;
            patch.ids.reportedChats.push(entity.id);

            if (reportedChat.avatar) {
                patches.push(this.entities.uploads.createPatch(reportedChat.avatar));
            }
        });

        return mergeWith(patch, ...patches, mergeCustomizer);
    }

}