import {action, computed, observable, runInAction} from "mobx";
import {ChatApi} from "../../api/clients";
import {EntitiesStore} from "../../entities-store";
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

    constructor(private readonly entities: EntitiesStore) {

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
                .then(({data}) => runInAction(() => {
                    const chat = {
                        ...data,
                        deletionReason: undefined,
                        deletionComment: undefined,
                        deleted: false,
                        unreadMessagesCount: 0
                    }
                    this.entities.chats.insert(chat);
                    this.previousChatId = this.selectedChatId;
                    this.selectedChatId = data.id;

                    if (this.errorsMap[slug]) {
                        delete this.errorsMap[slug];
                    }
                }))
                .catch(error => runInAction(() => this.errorsMap[slug] = getInitialApiErrorFromResponse(error)))
                .finally(() => runInAction(() => this.pending = false));
        }
    }
}
