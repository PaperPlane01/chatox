import {action, computed, observable, reaction, runInAction} from "mobx";
import {ChatStore} from "../../Chat";
import {FetchingState} from "../../utils/types";
import {ChatRoleApi} from "../../api";
import {EntitiesStoreV2} from "../../entities-store";

export class RolesOfChatStore {
    @observable
    pendingRolesMap: {
        [chatId: string]: FetchingState
    } = {};

    @observable
    chatRolesDialogOpen: boolean = false;

    @computed
    get selectedChatId(): string | undefined {
        return this.chatStore.selectedChatId;
    }

    @computed
    get rolesIdsOfCurrentChat(): string[] {
        if (!this.selectedChatId) {
            return [];
        }

        return this.entities.chatRoles
            .findAllByChat(this.selectedChatId)
            .sort((first, second) => first.level - second.level)
            .map(role => role.id);
    }

    @computed
    get pending(): boolean {
        if (!this.selectedChatId) {
            return this.chatStore.pending
        } else {
            return this.pendingRolesMap[this.selectedChatId] && this.pendingRolesMap[this.selectedChatId].pending;
        }
    }

    constructor(private readonly chatStore: ChatStore,
                private readonly entities: EntitiesStoreV2) {
        reaction(
            () => this.chatRolesDialogOpen,
            dialogOpen => {
                if (dialogOpen) {
                    this.fetchRolesOfChat();
                }
            }
        )
    }

    @action
    fetchRolesOfChat = (): void => {
        if (!this.selectedChatId) {
            return;
        }
        const chatId = this.selectedChatId;

        if (this.pendingRolesMap[this.selectedChatId] && (this.pendingRolesMap[this.selectedChatId].pending || this.pendingRolesMap[this.selectedChatId].initiallyFetched)) {
            return;
        }

        this.pendingRolesMap[this.selectedChatId] = {
            pending: true,
            initiallyFetched: false
        };

        ChatRoleApi.getRolesOfChat(this.selectedChatId)
            .then(({data}) => runInAction(() => {
                this.entities.chatRoles.insertAll(data);

                this.pendingRolesMap[chatId].initiallyFetched = true;
            }))
            .finally(() => runInAction(() => this.pendingRolesMap[chatId].pending = false));
    }

    @action
    setChatRolesDialogOpen = (chatRolesDialogOpen: boolean): void => {
        this.chatRolesDialogOpen = chatRolesDialogOpen;
    }

    @action
    openRolesList = (): void => this.setChatRolesDialogOpen(true);

    @action
    closeRolesList = (): void => this.setChatRolesDialogOpen(false);
}