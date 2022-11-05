import {action, computed, observable} from "mobx";
import {ChatApi} from "../../api/clients";
import {EntitiesStore, EntitiesStoreV2} from "../../entities-store";
import {ApiError, getInitialApiErrorFromResponse} from "../../api";
import {ChatOfCurrentUserEntity} from "../types";

interface ChatErrorsMap {
    [slug: string]: ApiError
}

export class ChatStore {
    @observable
    selectedChatId?: string = undefined;

    @observable
    pending: boolean = false;

    @observable
    errorsMap: ChatErrorsMap = {};

    @observable
    currentSlug?: string = undefined;

    @observable
    previousChatId?: string = undefined;

    constructor(private readonly entities: EntitiesStore,
                private readonly entitiesV2: EntitiesStoreV2) {

    }

    @computed
    get selectedChat(): ChatOfCurrentUserEntity | undefined {
        if (this.selectedChatId) {
            return this.entities.chats.findById(this.selectedChatId);
        }

        return undefined;
    }

    @action
    setSelectedChat = (slug?: string): void => {
        if (!slug) {
            this.selectedChatId = undefined;
            this.currentSlug = undefined;
            return;
        }

        this.currentSlug = slug;
        const chat = this.entities.chats.findBySlug(slug);

        if (chat) {
            this.previousChatId = this.selectedChatId;
            this.selectedChatId = chat.id;
        } else {
            this.pending = true;
            ChatApi.findChatByIdOrSlug(slug)
                .then(({data}) => {
                    const chat = {
                        ...data,
                        deletionReason: undefined,
                        deletionComment: undefined,
                        deleted: false,
                        unreadMessagesCount: 0
                    }
                    this.entities.insertChat(chat);
                    this.entitiesV2.chats.insert(chat);
                    this.previousChatId = this.selectedChatId;
                    this.selectedChatId = data.id;

                    if (this.errorsMap[slug]) {
                        delete this.errorsMap[slug];
                    }
                })
                .catch(error => this.errorsMap[slug] = getInitialApiErrorFromResponse(error))
                .finally(() => this.pending = false);
        }
    }
}
