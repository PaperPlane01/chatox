import {makeAutoObservable, runInAction} from "mobx";
import {HttpStatusCode} from "axios";
import {API_UNREACHABLE_STATUS, ApiError, ChatApi, getInitialApiErrorFromResponse} from "../../api";
import {JoinChatRejectionReason} from "../../api/types/response";
import {EntitiesStore} from "../../entities-store";
import {AuthorizationStore} from "../../Authorization";
import {PendingChatsOfCurrentUserStore} from "../../Chat";
import {SnackbarService} from "../../Snackbar";
import {Labels, LocaleStore} from "../../localization";

export class JoinChatStore {
    chatId?: string = undefined;

    pending: boolean = false;

    error?: ApiError = undefined;

    constructor(private readonly entities: EntitiesStore,
                private readonly pendingChats: PendingChatsOfCurrentUserStore,
                private readonly localization: LocaleStore,
                private readonly authorization: AuthorizationStore,
                private readonly snackbarService: SnackbarService) {
        makeAutoObservable(this);
    }

    joinChat = (chatId: string): void => {
        this.chatId = chatId;
        this.pending = true;
        const user = this.authorization.currentUser!;

        ChatApi.joinChat(chatId)
            .then(({data}) => {
                if (data.pending) {
                   this.pendingChats.addChatId(chatId);
                   this.showPendingSnackbar();
                } else {
                    this.entities.chatParticipations.insert({
                        ...data,
                        chatId,
                        user: {
                            ...user,
                            deleted: false,
                            online: true
                        }
                    }, {
                        increaseChatParticipantsCount: true
                    });
                    this.showSuccessfulJoinSnackbar();
                }
            })
            .catch(error => runInAction(() => {
                this.error = getInitialApiErrorFromResponse(error);
                this.handleError();
            }))
            .finally(() => runInAction(() => this.pending = false));
    }

    private showSuccessfulJoinSnackbar = (): void => {
        this.snackbarService.enqueueSnackbar(
            this.localization.getCurrentLanguageLabel("chat.join.success")
        );
    }

    private showPendingSnackbar = (): void => {
        this.snackbarService.enqueueSnackbar(
            this.localization.getCurrentLanguageLabel("chat.join.pending")
        );
    }

    private handleError = (): void => {
        if (!this.error) {
            return;
        }

        if (this.error.status === API_UNREACHABLE_STATUS) {
            this.snackbarService.error(
                this.localization.getCurrentLanguageLabel("server.unreachable")
            );
            return;
        }

        if (this.error.status !== HttpStatusCode.Forbidden) {
            this.showUnknownErrorSnackbar();
            return;
        }

        if (!this.error.metadata) {
            this.showUnknownErrorSnackbar();
            return;
        }

        const errorCode = this.error.metadata.errorCode;

        if (!errorCode || errorCode !== "JOIN_CHAT_REJECTED") {
            this.showUnknownErrorSnackbar();
            return;
        }

        const reason = this.error.metadata.additional?.reason;

        if (!reason) {
            this.showUnknownErrorSnackbar();
            return;
        }

        const handledReasons = [
            JoinChatRejectionReason.ALREADY_CHAT_PARTICIPANT,
            JoinChatRejectionReason.AWAITING_APPROVAL,
            JoinChatRejectionReason.INSUFFICIENT_VERIFICATION_LEVEL
        ];

        if (handledReasons.includes(reason)) {
            this.snackbarService.error(
                this.localization.getCurrentLanguageLabel(`chat.join.error.${reason}` as keyof Labels)
            );
        } else {
           this.showUnknownErrorSnackbar();
        }
    }

    private showUnknownErrorSnackbar = (): void => {
        this.snackbarService.error(
            this.localization.getCurrentLanguageLabel("chat.join.error")
        );
    }
}
