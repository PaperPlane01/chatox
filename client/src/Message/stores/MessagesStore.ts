import {merge, mergeWith, uniq} from "lodash";
import {MessageInsertOptions} from "../types";
import {convertMessageToNormalizedForm} from "../utils";
import {SoftDeletableEntityStore} from "../../entity-store";
import {EntitiesPatch, EntitiesStore, GetEntityType, RawEntitiesStore, RelationshipsIds} from "../../entities-store";
import {Message} from "../../api/types/response";
import {isDefined, mergeCustomizer} from "../../utils/object-utils";
import {UserChatRolesStore} from "../../ChatRole";
import {RequiredField} from "../../utils/types";

export class MessagesStore<MessageType extends "messages" | "scheduledMessages" | "draftMessages">
    extends SoftDeletableEntityStore<MessageType, GetEntityType<MessageType>, Message, MessageInsertOptions> {

    constructor(rawEntities: RawEntitiesStore,
                entityName: MessageType,
                entities: EntitiesStore,
                private readonly userChatRoles: UserChatRolesStore) {
        super(rawEntities, entityName, entities);
    }

    findByIdWithRelationships(id: string): readonly [GetEntityType<MessageType>, RelationshipsIds] {
        const message = this.findById(id);

        if (this.entityName !== "messages") {
            return [message, {}];
        }

        const relationships: RequiredField<RelationshipsIds, "users" | "uploads" | "stickers" | "chatRoles"> = {
            users: [],
            uploads: [],
            stickers: [],
            chatRoles: []
        };

        const [sender, senderRelationships] = this.entities.users.findByIdWithRelationships(message.sender);
        const mentionedUsersWithRelationships = this.entities.users.findAllByIdWithRelationships(message.mentionedUsers);
        const [forwardedBy, forwardedByRelationships] = message.forwardedById
            ? this.entities.users.findByIdWithRelationships(message.forwardedById)
            : [undefined, {}];
        const [sticker, stickerRelationships] = message.stickerId
            ? this.entities.stickers.findByIdWithRelationships(message.stickerId)
            : [undefined, {}];
        const [senderRole, senderRoleRelationships] = message.senderRoleId
            ? this.entities.chatRoles.findByIdWithRelationships(message.senderRoleId)
            : [undefined, {}];

        relationships.users.push(sender.id);
        relationships.uploads.push(...message.uploads);

        if (forwardedBy) {
            relationships.users.push(forwardedBy.id);
        }

        if (sticker) {
            relationships.stickers.push(sticker.id);
        }

        if (senderRole) {
            relationships.chatRoles.push(senderRole.id);
        }

        mentionedUsersWithRelationships.forEach(([user]) => relationships.users.push(user.id));
        const nestedRelationships = merge(
            senderRelationships,
            forwardedByRelationships,
            stickerRelationships,
            senderRoleRelationships
        );
        const resultRelationships = mergeWith(
            relationships,
            nestedRelationships,
            mergeCustomizer
        );

        return [
            message,
            resultRelationships
        ];
    }

    protected convertToNormalizedForm(denormalizedEntity: Message): GetEntityType<MessageType> {
        return convertMessageToNormalizedForm(denormalizedEntity) as GetEntityType<MessageType>;
    }

    createPatchForArray(denormalizedEntities: Message[], options?: MessageInsertOptions): EntitiesPatch {
        if (this.entityName === "messages") {
            return this.createPatchForNormalMessages(denormalizedEntities, options);
        } else if (this.entityName === "draftMessages") {
            return this.createPatchForDraftMessages(denormalizedEntities);
        } else {
            return this.createPatchForScheduledMessage(denormalizedEntities);
        }
    }

    private createPatchForNormalMessages(messages: Message[], insertOptions?: MessageInsertOptions): EntitiesPatch {
        const patch = this.createEmptyEntitiesPatch("messages", "chats");
        const patches: EntitiesPatch[] = [];

        messages.forEach(message => {
            patch.entities.messages[message.id] = this.convertToNormalizedForm(message);
            patch.ids.messages.push(message.id);

            const chat = insertOptions?.skipUpdatingChat
                ? undefined
                : this.entities.chats.findByIdOptional(message.chatId);

            if (chat) {
                chat.messages = uniq(chat.messages.concat(message.id));
                chat.indexToMessageMap[message.index] = message.id;

                if (!insertOptions || !insertOptions.skipSettingLastMessage) {
                    chat.lastMessage = message.id;
                }

                if (insertOptions && insertOptions.pinnedMessageId === message.id) {
                    chat.pinnedMessageId = message.id;
                }

                patch.entities.chats[message.chatId] = chat;
                patch.ids.chats.push(message.chatId);
            }

            patches.push(this.createUsersPatch(message));

            if (message.senderChatRole) {
                this.userChatRoles.insertInCache({
                    chatId: message.chatId,
                    roleId: message.senderChatRole.id,
                    userId: message.sender.id
                });
                patches.push(this.entities.chatRoles.createPatch(message.senderChatRole));
            }

            if (message.sticker) {
                patches.push(this.entities.stickers.createPatch(message.sticker));
            }

            if (message.attachments.length !== 0) {
                patches.push(this.entities.uploads.createPatchForArray(message.attachments));
            }

            if (message.referredMessage) {
                patches.push(
                    this.createPatchForNormalMessages(
                        [message.referredMessage],
                        {
                            skipSettingLastMessage: true,
                            skipUpdatingChat: insertOptions?.skipUpdatingChat ?? false
                        }
                    )
                );
            }
        });

        return mergeWith(patch, ...patches, mergeCustomizer);
    }

    private createPatchForScheduledMessage(messages: Message[]): EntitiesPatch {
        const patch = this.createEmptyEntitiesPatch("scheduledMessages", "chats");
        const patches: EntitiesPatch[] = [];

        messages.forEach(message => {
            patch.entities.scheduledMessages[message.id] = this.convertToNormalizedForm(message);
            patch.ids.scheduledMessages.push(message.id);

            const chat = this.rawEntities.entities.chats[message.chatId];
            chat.scheduledMessages.push(message.id);

            patch.entities.chats[message.chatId] = chat;
            patch.ids.chats.push(message.chatId);

            patches.push(this.createUsersPatch(message));

            if (message.senderChatRole) {
                patches.push(this.entities.chatRoles.createPatch(message.senderChatRole));
            }

            if (message.sticker) {
                patches.push(this.entities.stickers.createPatch(message.sticker));
            }

            if (message.attachments.length !== 0) {
                patches.push(this.entities.uploads.createPatchForArray(message.attachments));
            }

            if (message.referredMessage) {
                patches.push(
                    this.createPatchForNormalMessages(
                        [message.referredMessage],
                        {
                            skipSettingLastMessage: true,
                            skipUpdatingChat: true
                        }
                    )
                );
            }

            patches.push(this.entities.users.createPatch(message.sender));
        });

        return mergeWith(patch, ...patches, mergeCustomizer);
    }

    private createPatchForDraftMessages(draftMessages: Message[], options?: MessageInsertOptions): EntitiesPatch {
        const patch = this.createEmptyEntitiesPatch("draftMessages", "chats");
        const patches: EntitiesPatch[] = [];

        draftMessages.forEach(draftMessage => {
            patch.entities.draftMessages[draftMessage.id] = convertMessageToNormalizedForm(draftMessage);
            patch.ids.draftMessages.push(draftMessage.id);

            patches.push(this.createUsersPatch(draftMessage));

            if (options?.setDraftMessageToChat) {
                const chat = this.entities.chats.findById(draftMessage.chatId);
                chat.draftMessageId = draftMessage.id;
                patch.entities.chats[chat.id] = chat;
                patch.ids.chats.push(chat.id);
            }

            if (draftMessage.attachments.length !== 0) {
                patches.push(this.entities.uploads.createPatchForArray(draftMessage.attachments));
            }

            if (draftMessage.referredMessage) {
                patches.push(this.createPatchForNormalMessages(
                    [draftMessage.referredMessage],
                    {
                        skipSettingLastMessage: true,
                        skipUpdatingChat: true
                    }
                ));
            }
        })

        return mergeWith(patch, ...patches, mergeCustomizer);
    }

    private createUsersPatch(message: Message): EntitiesPatch {
        return this.entities.users.createPatchForArray(
            [
                message.sender,
                message.forwardedBy,
                ...message.mentionedUsers
            ]
                .filter(isDefined)
        );
    }
}