import {makeAutoObservable, runInAction} from "mobx";
import {ApiError, ChatInviteApi, getInitialApiErrorFromResponse} from "../../api";
import {ChatInviteMinified} from "../../api/types/response";
import {EntitiesStore} from "../../entities-store";

export class ChatInviteInfoStore {
    chatInvite?: ChatInviteMinified = undefined;

    pending = false;

    error?: ApiError = undefined;

    constructor(private readonly entities: EntitiesStore) {
        makeAutoObservable(this);
    }

    fetchChatInvite = (chatInviteId: string): void => {
        this.pending = true;
        this.error = undefined;

        ChatInviteApi.getChatInviteById(chatInviteId)
            .then(({data}) => runInAction(() => {
               this.chatInvite = data;

               const existingChat = this.entities.chats.findByIdOptional(data.chat.id);

               if (!existingChat) {
                   this.entities.chats.insert({
                       ...data.chat,
                       deletionReason: undefined,
                       deletionComment: undefined,
                       deleted: false,
                       unreadMessagesCount: 0
                   });
               }
            }))
            .catch(error => runInAction(() => this.error = getInitialApiErrorFromResponse(error)))
            .finally(() => runInAction(() => this.pending = false));
    }

    reset = (): void => {
        this.chatInvite = undefined;
        this.error = undefined;
        this.pending = false;
    }
}