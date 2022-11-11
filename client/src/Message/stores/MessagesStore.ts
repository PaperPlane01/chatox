import {mergeWith, uniq} from "lodash";
import {MessageInsertOptions} from "../types";
import {convertMessageToNormalizedForm} from "../utils";
import {SoftDeletableEntityStore} from "../../entity-store";
import {EntitiesPatch, GetEntityType} from "../../entities-store";
import {Message} from "../../api/types/response";
import {ChatOfCurrentUserEntity} from "../../Chat";
import {mergeCustomizer} from "../../utils/object-utils";

export class MessagesStore<MessageType extends "messages" | "scheduledMessages">
    extends SoftDeletableEntityStore<MessageType, GetEntityType<MessageType>, Message, MessageInsertOptions> {

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
        let chat: ChatOfCurrentUserEntity | undefined = undefined;
        if (messages.length !== 0) {
            chat = this.entities.chats.findByIdOptional(messages[0].chatId);
        }

        const patch = this.createEmptyEntitiesPatch("messages", "chats");
        const patches: EntitiesPatch[] = [];

        messages.forEach(message => {
            patch.entities.messages[message.id] = this.convertToNormalizedForm(message);
            patch.ids.messages.push(message.id);

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

            patches.push(this.entities.users.createPatch(message.sender));

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
                    this.createPatchForNormalMessages([message.referredMessage], {skipSettingLastMessage: true})
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
                    this.createPatchForNormalMessages([message.referredMessage], {skipSettingLastMessage: true})
                );
            }

            patches.push(this.entities.users.createPatch(message.sender));
        });

        return mergeWith(patch, ...patches, mergeCustomizer);
    }
}