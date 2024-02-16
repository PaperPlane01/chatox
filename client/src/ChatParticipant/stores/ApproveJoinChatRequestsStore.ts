import {makeAutoObservable, observable, runInAction, values} from "mobx";
import {computedFn} from "mobx-utils";
import {HttpStatusCode} from "axios";
import {JoinChatRequestsStore} from "./JoinChatRequestsStore";
import {API_UNREACHABLE_STATUS, ApiError, ChatParticipantApi, getInitialApiErrorFromResponse} from "../../api";
import {PendingChatParticipantsRequest} from "../../api/types/request";
import {ChatParticipation} from "../../api/types/response";
import {EntitiesStore} from "../../entities-store";
import {ChatStore} from "../../Chat";
import {SnackbarService} from "../../Snackbar";
import {LocaleStore} from "../../localization";

export class ApproveJoinChatRequestsStore {
    pending = false;

    error?: ApiError = undefined;

    pendingApprovalsMap = observable.map<string, boolean>();

    get approvalsPending(): boolean {
        return values(this.pendingApprovalsMap).length !== 0 && values(this.pendingApprovalsMap).includes(true);
    }

    constructor(private readonly joinChatRequests: JoinChatRequestsStore,
                private readonly chat: ChatStore,
                private readonly entities: EntitiesStore,
                private readonly locale: LocaleStore,
                private readonly snackbarService: SnackbarService) {
        makeAutoObservable(this);
    }

    approveSelectedJoinChatRequests = (): void => {
        if (!this.chat.selectedChatId) {
            return;
        }

        this.pending = true;
        this.error = undefined;

        const request: PendingChatParticipantsRequest = {
            pendingChatParticipantsIds: this.joinChatRequests.joinChatRequestsIds
        };

        ChatParticipantApi.approvePendingChatParticipants(this.chat.selectedChatId, request)
            .then(({data}) => this.handleApprovalResponse(
                data,
                request.pendingChatParticipantsIds
            ))
            .catch(error => runInAction(() => {
                this.error = getInitialApiErrorFromResponse(error);
                this.showErrorSnackbar();
            }))
            .finally(() => runInAction(() => this.pending = false));
    }

    approveSingleJoinChatRequest = (requestId: string): void => {
        if (!this.chat.selectedChatId) {
            return;
        }

        if (this.isApprovalPending(requestId)) {
            return;
        }

        this.error = undefined;
        this.pendingApprovalsMap.set(requestId, true);

        const request: PendingChatParticipantsRequest = {
            pendingChatParticipantsIds: [requestId]
        };

        ChatParticipantApi.approvePendingChatParticipants(this.chat.selectedChatId, request)
            .then(({data}) => this.handleApprovalResponse(
                data,
                request.pendingChatParticipantsIds
            ))
            .catch(error => runInAction(() => {
                this.error = getInitialApiErrorFromResponse(error);
                this.showErrorSnackbar();
            }))
            .finally(() => runInAction(() => this.pendingApprovalsMap.delete(requestId)));
    }

    private handleApprovalResponse = (
        chatParticipations: ChatParticipation[],
        pendingChatParticipantsIds: string[]
    ): void => {
        this.entities.chatParticipations.insertAll(chatParticipations, {
            increaseChatParticipantsCount: true
        });
        this.joinChatRequests.removeRequests(pendingChatParticipantsIds);
        this.entities.pendingChatParticipations.deleteAllById(pendingChatParticipantsIds);
        this.snackbarService.enqueueSnackbar(
            this.locale.getCurrentLanguageLabel("chat.join.request.approve.success")
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
                    this.locale.getCurrentLanguageLabel("chat.join.request.approve.error.no-access"),
                    "error"
                );
                break;
            default:
                this.snackbarService.enqueueSnackbar(
                    this.locale.getCurrentLanguageLabel(
                        "chat.join.request.approve.error.unknown",
                        {errorStatus: this.error.status}
                    ),
                    "error"
                );
                break;
        }
    }

    isApprovalPending = computedFn((requestId: string): boolean => this.pendingApprovalsMap.get(requestId) ?? false)
}