import {makeObservable, observable, ObservableSet, override} from "mobx";
import {mergeWith, orderBy} from "lodash";
import {MessageReactionEntity} from "../types";
import {createMessageEmojiKey} from "../utils";
import {MessageReaction} from "../../api/types/response";
import {AbstractEntityStore} from "../../entity-store";
import {EntitiesPatch, EntitiesStore, RawEntitiesStore, RawEntityKey, RelationshipsIds} from "../../entities-store";
import {mergeCustomizer} from "../../utils/object-utils";

export class MessageReactionsStore extends AbstractEntityStore<"messageReactions", MessageReactionEntity, MessageReaction> {
    private readonly messageIndex = observable.map<string, ObservableSet<string>>();
    private readonly messageEmojiIndex = observable.map<string, ObservableSet<string>>();

    constructor(rawEntities: RawEntitiesStore, entityName: RawEntityKey, entities: EntitiesStore) {
        super(rawEntities, entityName, entities);

        makeObservable(this, {
            insert: override,
            insertAll: override,
            deleteById: override,
            deleteAllById: override
        });
    }

    insert(entity: MessageReaction, options?: {}): MessageReactionEntity {
        const reaction = super.insert(entity, options);
        this.populateIndexes([reaction]);
        return reaction;
    }

    insertAll(entities: MessageReaction[], options?: {}): void {
        super.insertAll(entities, options);
        const reactions = this.findAllById(entities.map(reaction => reaction.id));
        this.populateIndexes(reactions);
    }

    private populateIndexes(messageReactions: MessageReactionEntity[]): void {
        messageReactions.forEach(messageReaction => {
            this.populateMessageIndex(messageReaction);
            this.populateMessageEmojiIndex(messageReaction);
        });
    }

    private populateMessageIndex(messageReaction: MessageReactionEntity): void {
        if (!this.messageIndex.has(messageReaction.messageId)) {
            this.messageIndex.set(messageReaction.messageId, observable.set());
        }

        this.messageIndex.get(messageReaction.messageId)!.add(messageReaction.id);
    }

    private populateMessageEmojiIndex(messageReaction: MessageReactionEntity): void {
        const key = this.createMessageEmojiKeyFromEntity(messageReaction);

        if (!this.messageEmojiIndex.has(key)) {
            this.messageEmojiIndex.set(key, observable.set());
        }

        this.messageEmojiIndex.get(key)!.add(messageReaction.id);
    }

    private createMessageEmojiKeyFromEntity(messageReaction: MessageReactionEntity): string {
        return createMessageEmojiKey(messageReaction.messageId, messageReaction.emojiId);
    }

    deleteAllById(ids: string[], options?: {}) {
        const entities = this.findAllById(ids);
        entities.forEach(entity => this.cleanupIndexes(entity));

        super.deleteAllById(ids, options);
    }

    deleteById(id: string, options?: {}): void {
        const entity = this.findByIdOptional(id);

        if (entity) {
            this.cleanupIndexes(entity);
        }

        super.deleteById(id, options);
    }

    private cleanupIndexes(messageReaction: MessageReactionEntity): void {
        this.messageIndex.get(messageReaction.messageId)?.delete(messageReaction.id);
        this.messageEmojiIndex.get(this.createMessageEmojiKeyFromEntity(messageReaction))?.delete(messageReaction.id);
    }

    findByMessageId(messageId: string): MessageReactionEntity[] {
        const ids = this.messageIndex.get(messageId) ?? [];
        const messageReactions = this.findAllById(ids);

        return orderBy(
            messageReactions,
            reaction => reaction.createdAt,
            "desc"
        );
    }

    findByMessageIdAndEmojiId(messageId: string, emojiId: string): MessageReactionEntity[] {
        const key = createMessageEmojiKey(messageId, emojiId);
        const ids = this.messageEmojiIndex.get(key) ?? [];
        const messageReactions = this.findAllById(ids);

        return orderBy(
            messageReactions,
            reaction => reaction.createdAt,
            "desc"
        );
    }

    protected convertToNormalizedForm(denormalizedEntity: MessageReaction): MessageReactionEntity {
        return {
            id: denormalizedEntity.id,
            userId: denormalizedEntity.user.id,
            createdAt: new Date(denormalizedEntity.createdAt),
            emojiId: denormalizedEntity.emojiId,
            messageId: denormalizedEntity.messageId
        }
    }

    createPatchForArray(denormalizedEntities: MessageReaction[], options?: {} | undefined): EntitiesPatch {
        const patch = this.createEmptyEntitiesPatch("messageReactions", "users", "uploads");
        const patches: EntitiesPatch[] = [];

        denormalizedEntities.forEach(messageReaction => {
            patch.entities.messageReactions[messageReaction.id] = this.convertToNormalizedForm(messageReaction);
            patch.ids.messageReactions.push(messageReaction.id);
            patches.push(this.entities.users.createPatch(messageReaction.user, {retrieveOnlineStatusFromExistingUser: true}));
        });

        return mergeWith(patch, patches, mergeCustomizer);
    }


    findByIdWithRelationships(id: string): readonly [MessageReactionEntity, RelationshipsIds] {
        const messageReaction = this.findById(id);
        const [user, userRelationships] = this.entities.users.findByIdWithRelationships(messageReaction.userId);
        const relationshipsIds: RelationshipsIds = {
            users: [user.id],
            uploads: userRelationships.uploads
        };
        return [messageReaction, relationshipsIds];
    }
}
