import {runInAction} from "mobx";
import {RouterStore} from "mobx-router";
import {ChatInviteInfoStore} from "./ChatInviteInfoStore";
import {ApiError, ChatApi, getInitialApiErrorFromResponse} from "../../api";
import {EntitiesStore} from "../../entities-store";
import {SnackbarService} from "../../Snackbar";
import {PendingChatsOfCurrentUserStore} from "../../Chat";
import {AuthorizationStore} from "../../Authorization";
import {RouterStoreAware, Routes} from "../../router";
import {LocaleStore} from "../../localization";
import {ChatInviteMinified, ChatParticipationWithoutUser, CurrentUser} from "../../api/types/response";

export class JoinChatByInviteStore implements RouterStoreAware {
    pending = false;

    error?: ApiError = undefined;

    private routerStore?: RouterStore<any> = undefined;

    constructor(private readonly chatInvite: ChatInviteInfoStore,
                private readonly pendingChats: PendingChatsOfCurrentUserStore,
                private readonly entities: EntitiesStore,
                private readonly authorization: AuthorizationStore,
                private readonly localization: LocaleStore,
                private readonly snackbarService: SnackbarService) {
    }

    setRouterStore = (routerStore: RouterStore<any>): void => {
        this.routerStore = routerStore;
    }

    joinChat = (): void => {
        if (!this.chatInvite.chatInvite) {
            return;
        }

        if (!this.chatInvite.chatInvite.usage.canBeUsed) {
            return;
        }

        if (!this.authorization.currentUser) {
            return;
        }

        const chatInvite = this.chatInvite.chatInvite;
        const user = this.authorization.currentUser;

        this.pending = true;
        this.error = undefined;

        ChatApi.joinChatByInvite(chatInvite.chat.id, chatInvite.id)
            .then(({data}) => runInAction(() => {
                if (data.pending) {
                   this.handlePendingChat(chatInvite);
                } else {
                   this.handleNewChatParticipation(chatInvite, data, user);
                }
            }))
            .catch(error => runInAction(() => this.error = getInitialApiErrorFromResponse(error)))
            .finally(() => runInAction(() => this.pending = false));
    }

    private handlePendingChat = (chatInvite: ChatInviteMinified): void => {
        this.pendingChats.addChatId(chatInvite.chat.id);

        if (this.routerStore) {
            this.routerStore.goTo(Routes.pendingChats);
        }
    }

    private handleNewChatParticipation = (
        chatInvite: ChatInviteMinified,
        chatParticipation: ChatParticipationWithoutUser,
        currentUser: CurrentUser
    ): void => {
        this.entities.chatParticipations.insert({
            ...chatParticipation,
            chatId: chatInvite.chat.id,
            user: {
                ...currentUser,
                deleted: false,
                online: true
            }
        }, {
            increaseChatParticipantsCount: true
        });
        this.snackbarService.enqueueSnackbar(
            this.localization.getCurrentLanguageLabel("chat.join.success")
        );

        if (this.routerStore) {
            this.routerStore.goTo(Routes.chatPage, {
                slug: chatInvite.chat.slug ?? chatInvite.chat.id
            });
        }
    }
}