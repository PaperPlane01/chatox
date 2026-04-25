import {makeAutoObservable, reaction, runInAction} from "mobx";
import {ConfirmationTokenStore} from "../../ConfirmationToken/stores";
import {ApiError, ChatApi, getInitialApiErrorFromResponse} from "../../api";
import {ChatStore} from "./ChatStore";
import {isDefined} from "../../utils/object-utils";
import {EntitiesStore} from "../../entities-store";
import {AuthorizationStore} from "../../Authorization";
import {RouterStoreAware, Routes} from "../../router";
import {RouterStore} from "mobx-router";
import {LocaleStore} from "../../localization";
import {SnackbarService} from "../../Snackbar";
import {UserEntity} from "../../User";

export class TransferChatOwnershipStore implements RouterStoreAware {
    selectedUserId: string | undefined = undefined;

    pending = false;

    error?: ApiError = undefined;

    private routerStore?: RouterStore<any> = undefined;

    get selectedUser(): UserEntity | undefined {
        if (!this.selectedUserId) {
            return undefined;
        }

        return this.entities.users.findById(this.selectedUserId);
    }

    constructor(private readonly chat: ChatStore,
                private readonly confirmationToken: ConfirmationTokenStore,
                private readonly entities: EntitiesStore,
                private readonly authorization: AuthorizationStore,
                private readonly locale: LocaleStore,
                private readonly snackbarService: SnackbarService) {
        makeAutoObservable(this, {}, {autoBind: true});

        reaction(
            () => this.selectedUser,
            selectedUser => {
                if (selectedUser?.anonymous) {
                    this.snackbarService.error(
                        this.locale.getCurrentLanguageLabel("user.select.error.anonymous-not-allowed")
                    );
                }
            }
        );
    }

    setRouterStore(routerStore: RouterStore<any>) {
        this.routerStore = routerStore;
    }

    setSelectedUserId(userId: string): void {
        this.selectedUserId = userId;
    }

    resetSelectedUserId(): void {
        this.selectedUserId = undefined;
    }

    transferChatOwnership(): void {
        const confirmationToken = this.confirmationToken.getConfirmationToken();

        if (!isDefined(this.chat.selectedChat?.id)
            || !isDefined(this.selectedUserId)
            || !isDefined(confirmationToken)) {
            return;
        }

        if (this.selectedUser?.anonymous) {
            this.snackbarService.error(
                this.locale.getCurrentLanguageLabel("user.select.error.anonymous-not-allowed")
            );
            return;
        }

        ChatApi.transferChatOwnership(
            this.chat.selectedChat.id,
            {
                userId: this.selectedUserId
            },
            confirmationToken
        )
            .then(({data}) => {
                if (this.routerStore && this.chat.selectedChat) {
                    this.routerStore.goTo(Routes.chatPage, {slug: this.chat.selectedChat.slug ?? this.chat.selectedChat.id});
                    this.snackbarService.enqueueSnackbar(
                        this.locale.getCurrentLanguageLabel("chat.ownership.transfer.success")
                    );
                }

                this.entities.chatParticipations.insert(data.oldOwer);
                this.entities.chatParticipations.insert(data.newOwner);

                const chat = this.entities.chats.findByIdOptional(data.chatId);

                if (chat) {
                    chat.createdByCurrentUser = data.newOwner.user.id === this.authorization.currentUser?.id;
                }
            })
            .catch(error => runInAction(() => this.error = getInitialApiErrorFromResponse(error)))
            .finally(() => runInAction(() => this.pending = false));
    }
}
