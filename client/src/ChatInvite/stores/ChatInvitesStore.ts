import {mergeWith} from "lodash";
import {ChatInviteEntity} from "../types";
import {AbstractEntityStore} from "../../entity-store";
import {EntitiesPatch} from "../../entities-store";
import {ChatInvite} from "../../api/types/response";
import {isDefined, mergeCustomizer} from "../../utils/object-utils";

export class ChatInvitesStore extends AbstractEntityStore<"chatInvites", ChatInviteEntity, ChatInvite> {
    protected convertToNormalizedForm(denormalizedEntity: ChatInvite): ChatInviteEntity {
        return {
            id: denormalizedEntity.id,
            active: denormalizedEntity.active,
            chatId: denormalizedEntity.chatId,
            createdAt: new Date(denormalizedEntity.createdAt),
            createdById: denormalizedEntity.createdBy.id,
            expiresAt: denormalizedEntity.expiresAt ? new Date(denormalizedEntity.expiresAt) : undefined,
            lastUsedAt: denormalizedEntity.lastUsedAt ? new Date(denormalizedEntity.lastUsedAt) : undefined,
            lastUsedById: denormalizedEntity.lastUsedBy?.id,
            maxUseTimes: denormalizedEntity.maxUseTimes,
            updatedAt: denormalizedEntity.updatedAt ? new Date(denormalizedEntity.updatedAt) : undefined,
            updatedById: denormalizedEntity.updatedBy?.id,
            useTimes: denormalizedEntity.useTimes,
            userId: denormalizedEntity.user?.id,
            name: denormalizedEntity.name,
            joinAllowanceSettings: denormalizedEntity.joinAllowanceSettings
        }
    }

    createPatchForArray(denormalizedEntities: ChatInvite[]): EntitiesPatch {
        const patch = this.createEmptyPatch();
        const patches: EntitiesPatch[] = [];

        denormalizedEntities.forEach(chatInvite => {
            patch.entities.chatInvites[chatInvite.id] = this.convertToNormalizedForm(chatInvite);
            patch.ids.chatInvites.push(chatInvite.id);
            const users = [
                chatInvite.createdBy,
                chatInvite.updatedBy,
                chatInvite.user,
                chatInvite.lastUsedBy
            ]
                .filter(isDefined);
            patches.push(this.entities.users.createPatchForArray(users));
        });

        return mergeWith(patch, ...patches, mergeCustomizer);
    }
}