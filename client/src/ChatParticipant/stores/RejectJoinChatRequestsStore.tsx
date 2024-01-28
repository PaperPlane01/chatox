import {makeAutoObservable, observable, runInAction, values} from "mobx";
import {computedFn} from "mobx-utils";
import {HttpStatusCode} from "axios";
import {JoinChatRequestsStore} from "./JoinChatRequestsStore";
import {API_UNREACHABLE_STATUS, ApiError, ChatParticipantApi, getInitialApiErrorFromResponse} from "../../api";
import {ChatStore} from "../../Chat";
import {EntitiesStore} from "../../entities-store";
import {LocaleStore} from "../../localization";
import {SnackbarService} from "../../Snackbar";
import {PendingChatParticipantsRequest} from "../../api/types/request";

export class RejectJoinChatRequestsStore {
    pending = false;

    error?: ApiError = undefined;

    pendingRejectionsMap = observable.map<string, boolean>();

    get rejectionsPending(): boolean {
        return values(this.pendingRejectionsMap).length !== 0 && values(this.pendingRejectionsMap).includes(true);
    }

    constructor(private readonly joinChatRequests: JoinChatRequestsStore,
                private readonly chat: ChatStore,
                private readonly entities: EntitiesStore,
                private readonly locale: LocaleStore,
                private readonly snackbarService: SnackbarService) {
        makeAutoObservable(this);
    }

    rejectSelectedJoinChatRequests = (): void => {
        if (!this.chat.selectedChatId) {
            return;
        }

        this.pending = true;
        this.error = undefined;

        const request: PendingChatParticipantsRequest = {
            pendingChatParticipantsIds: this.joinChatRequests.selectedJoinChatRequestsIds
        };

        ChatParticipantApi.rejectPendingChatParticipants(
            this.chat.selectedChatId,
            request
        )
            .then(() => this.handleRejections(request.pendingChatParticipantsIds))
            .catch(error => runInAction(() => {
                this.error = getInitialApiErrorFromResponse(error);
                this.showErrorSnackbar();
            }))
            .finally(() => runInAction(() => this.pending = false));
    }

    rejectSingleJoinChatRequest = (requestId: string): void => {
        if (!this.chat.selectedChatId) {
            return;
        }

        if (this.isRejectionPending(requestId)) {
            return;
        }

        this.error = undefined;
        this.pendingRejectionsMap.set(requestId, true);

        const request: PendingChatParticipantsRequest = {
            pendingChatParticipantsIds: [requestId]
        };

        ChatParticipantApi.rejectPendingChatParticipants(
            this.chat.selectedChatId,
            request
        )
            .then(() => this.handleRejections(request.pendingChatParticipantsIds))
            .catch(error => runInAction(() => {
                this.error = getInitialApiErrorFromResponse(error);
                this.showErrorSnackbar();
            }))
            .finally(() => runInAction(() => this.pendingRejectionsMap.delete(requestId)));
    }

    private handleRejections = (pendingChatParticipantsIds: string[]): void => {
        this.joinChatRequests.removeRequests(pendingChatParticipantsIds);
        this.entities.pendingChatParticipations.deleteAllById(pendingChatParticipantsIds);
        this.snackbarService.enqueueSnackbar(
            this.locale.getCurrentLanguageLabel("chat.join.request.reject.success")
        );
    }

    private showErrorSnackbar = (): void => {
        if (!this.error) {
            return;
        }

        switch (this.error.status) {
            case API_UNREACHABLE_STATUS:
                this.snackbarService.enqueueSnackbar(
                    this.locale.getCurrentLanguageLabel("common.error.server-unreachable"),
                    "error"
                );
                break;
            case HttpStatusCode.Forbidden:
                this.snackbarService.enqueueSnackbar(
                    this.locale.getCurrentLanguageLabel("chat.join.request.reject.error.no-access"),
                    "error"
                );
                break;
            default:
                this.snackbarService.enqueueSnackbar(
                    this.locale.getCurrentLanguageLabel(
                        "chat.join.request.reject.error.unknown",
                        {errorStatus: this.error.status}
                    ),
                    "error"
                );
                break;
        }
    }

    isRejectionPending = computedFn((requestId: string): boolean => this.pendingRejectionsMap.get(requestId) ?? false)
}
