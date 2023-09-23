import {makeAutoObservable, runInAction} from "mobx";
import {computedFn} from "mobx-utils";
import {ChatStore} from "../../Chat";
import {FetchingState, FetchOptions} from "../../utils/types";
import {EntitiesStore} from "../../entities-store";
import {ChatApi} from "../../api";

interface OnlineChatParticipantsFetchingStateMap {
    [chatId: string]: FetchingState
}

export class OnlineChatParticipantsStore {
    fetchingStateMap: OnlineChatParticipantsFetchingStateMap = {};

    get selectedChat(): string | undefined {
        return this.chatStore.selectedChatId;
    }

    get onlineParticipants(): string[] {
        if (this.selectedChat) {
            const participants = this.entities.chatParticipations.findByChat(this.selectedChat);

            return participants.filter(participantId => {
                const participant = this.entities.chatParticipations.findById(participantId);
                const user = this.entities.users.findById(participant.userId);
                return user.online;
            });
        } else {
            return [];
        }
    }

    get onlineParticipantsCount(): number {
        return this.onlineParticipants.length;
    }

    constructor(private readonly entities: EntitiesStore,
                private readonly chatStore: ChatStore) {
        makeAutoObservable(this);
    }

    getFetchingState = computedFn((chatId: string) => {
        if (this.fetchingStateMap[chatId]) {
            return this.fetchingStateMap[chatId];
        } else {
            return {
                pending: false,
                initiallyFetched: false
            };
        }
    });

    fetchChatParticipants = (fetchOptions: FetchOptions = {abortIfInitiallyFetched: true}) => {
        if (this.selectedChat) {
            const chatId = this.selectedChat;
            if (!this.fetchingStateMap[chatId]) {
                this.fetchingStateMap[chatId] = {
                    pending: false,
                    initiallyFetched: false
                };
            }

            if (this.getFetchingState(chatId).initiallyFetched && fetchOptions.abortIfInitiallyFetched) {
                return;
            }

            ChatApi.getOnlineChatParticipants(chatId)
                .then(({data}) => {
                    this.entities.chatParticipations.insertAll(data);
                    this.fetchingStateMap[chatId].initiallyFetched = true;
                })
                .finally(() => runInAction(() => this.fetchingStateMap[chatId].pending = false));
        }
    };
}
