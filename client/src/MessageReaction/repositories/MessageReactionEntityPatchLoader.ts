import {MessageReactionRepository} from "./MessageReactionRepository";
import {MessageReactionRelationshipsLoader} from "./MessageReactionRelationshipsLoader";
import {MessageReactionEntity} from "../types";
import {EntityPatchLoader} from "../../repository";
import {createEmptyEntitiesPatch, EntitiesPatch, populatePatch} from "../../entities-store";

export class MessageReactionEntityPatchLoader implements EntityPatchLoader<MessageReactionEntity> {
    constructor(private readonly messageReactionRepository: MessageReactionRepository,
                private readonly relationshipsLoader: MessageReactionRelationshipsLoader) {
    }

    async restoreEntityPatch(id: string): Promise<EntitiesPatch> {
        const patch = createEmptyEntitiesPatch("messageReactions", "users", "uploads");
        const messageReaction = await this.messageReactionRepository.findById(id);

        if (!messageReaction) {
            return patch;
        }

        const relationships = await this.relationshipsLoader.loadRelationships(messageReaction);

        populatePatch(patch, "messageReactions", [messageReaction]);
        populatePatch(patch, "users", relationships.users);
        populatePatch(patch, "uploads", relationships.uploads);

        return patch;
    }

    async restoreEntityPatchForArray(ids: string[]): Promise<EntitiesPatch> {
        const messageReactions = await this.messageReactionRepository.findAllById(ids);
        return await this.restoreEntityPatchForEntities(messageReactions);
    }

    async restoreEntityPatchForEntities(entities: MessageReactionEntity[]): Promise<EntitiesPatch> {
        const relationships = await this.relationshipsLoader.loadRelationshipsForArray(entities);
        const patch = createEmptyEntitiesPatch("messageReactions", "users", "uploads");

        populatePatch(patch, "messageReactions", entities)
        populatePatch(patch, "users", relationships.users);
        populatePatch(patch, "uploads", relationships.uploads);

        return patch;
    }
}