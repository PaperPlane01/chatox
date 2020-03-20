import {createTransformer} from "mobx-utils";
import {EntitiesStore} from "../../entities-store";

export class MessagesOfChatStore {
    constructor(private readonly entitiesStore: EntitiesStore) {}

    getMessagesOfChat = createTransformer((chatId: string) => {
        const messages = this.entitiesStore.chats.findById(chatId).messages;
        return messages.sort((left, right) => {
            const leftMessage = this.entitiesStore.messages.findById(left);
            const rightMessage = this.entitiesStore.messages.findById(right);

            return leftMessage.createdAt.getTime() - rightMessage.createdAt.getTime();
        })
    })
}
