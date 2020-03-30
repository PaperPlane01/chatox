import {action, observable} from "mobx";
import {ChatApi} from "../../api/clients";
import {EntitiesStore} from "../../entities-store";
import {ApiError, getInitialApiErrorFromResponse} from "../../api";

export class ChatStore {
    @observable
    selectedChatId?: string = undefined;

    @observable
    pending: boolean = false;

    @observable
    error?: ApiError = undefined;

    constructor(private readonly entities: EntitiesStore) {}

    @action
    setSelectedChat = (slug: string): void => {
        const chat = this.entities.chats.findBySlug(slug);
        if (chat) {
            this.selectedChatId = chat.id;
        } else {
            this.pending = true;
            ChatApi.findChatByIdOrSlug(slug)
                .then(({data}) => {
                    this.entities.insertChat({
                        ...data,
                        unreadMessagesCount: 0
                    });
                    this.selectedChatId = data.id;
                })
                .catch(error => this.error = getInitialApiErrorFromResponse(error))
                .finally(() => this.pending = false);
        }
    }
}
