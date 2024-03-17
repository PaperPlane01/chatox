import {mergeWith, uniq} from "lodash";
import {MessageInsertOptions} from "../types";
import {convertMessageToNormalizedForm} from "../utils";
import {SoftDeletableEntityStore} from "../../entity-store";
import {EntitiesPatch, EntitiesStore, GetEntityType, RawEntitiesStore} from "../../entities-store";
import {Message} from "../../api/types/response";
import {isDefined, mergeCustomizer} from "../../utils/object-utils";
import {UserChatRolesStore} from "../../ChatRole";

export class MessagesStore<MessageType extends "messages" | "scheduledMessages">
    extends SoftDeletableEntityStore<MessageType, GetEntityType<MessageType>, Message, MessageInsertOptions> {

    constructor(rawEntities: RawEntitiesStore,
                entityName: MessageType,
                entities: EntitiesStore,
                private readonly userChatRoles: UserChatRolesStore) {
        super(rawEntities, entityName, entities);
    }

    protected convertToNormalizedForm(denormalizedEntity: Message): GetEntityType<MessageType> {
        return convertMessageToNormalizedForm(denormalizedEntity) as GetEntityType<MessageType>;
    }

    createPatchForArray(denormalizedEntities: Message[], options?: MessageInsertOptions): EntitiesPatch {
        if (this.entityName === "messages") {
            return this.createPatchForNormalMessages(denormalizedEntities, options);
        } else {
            return this.createPatchForScheduledMessage(denormalizedEntities);
        }
    }

    private createPatchForNormalMessages(messages: Message[], insertOptions?: MessageInsertOptions) {
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

                patch.entities.chats[message.chatId] = chat;
                patch.ids.chats.push(message.chatId);

                if (insertOptions && insertOptions.pinnedMessageId === message.id) {
                    chat.pinnedMessageId = message.id;
                }
            }

            patches.push(this.entities.users.createPatchForArray(
                [
                    message.sender,
                    message.forwardedBy,
                    ...message.mentionedUsers
                ]
                    .filter(isDefined)
            ));

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

    private createPatchForScheduledMessage(messages: Message[]) {
        const patch = this.createEmptyEntitiesPatch("scheduledMessages", "chats");
        const patches: EntitiesPatch[] = [];

        messages.forEach(message => {
            patch.entities.scheduledMessages[message.id] = this.convertToNormalizedForm(message);
            patch.ids.scheduledMessages.push(message.id);

            const chat = this.rawEntities.entities.chats[message.chatId];
            chat.scheduledMessages.push(message.id);

            patch.entities.chats[message.chatId] = chat;
            patch.ids.chats.push(message.chatId);

            if (message.senderChatRole) {
                patches.push(this.entities.chatRoles.createPatch(message.senderChatRole));
            }

            if (message.sticker) {
                patches.push(this.entities.stickers.createPatch(message.sticker));
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
}