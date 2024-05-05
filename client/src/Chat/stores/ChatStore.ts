import {makeAutoObservable, runInAction} from "mobx";
import {ChatOfCurrentUserEntity} from "../types";
import {ApiError, ChatApi, getInitialApiErrorFromResponse} from "../../api";
import {EntitiesStore} from "../../entities-store";

interface ChatErrorsMap {
    [slug: string]: ApiError
}

export class ChatStore {
    selectedChatId?: string = undefined;

    pending: boolean = false;

    errorsMap: ChatErrorsMap = {};

    currentSlug?: string = undefined;

    previousChatId?: string = undefined;

    constructor(private readonly entities: EntitiesStore) {
       makeAutoObservable(this);
    }

    get selectedChat(): ChatOfCurrentUserEntity | undefined {
        if (this.selectedChatId) {
            return this.entities.chats.findById(this.selectedChatId);
        }

        return undefined;
    }

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
                        unreadMessagesCount: 0,
                        unreadMentionsCount: 0
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
    };
}
