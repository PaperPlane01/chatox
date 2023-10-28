import {makeAutoObservable, reaction} from "mobx";
import {RouterStore} from "mobx-router";
import {ChatStore} from "./ChatStore";
import {ChatDeletionStep, ChatOfCurrentUserEntity, DeleteChatFormData} from "../types";
import {validateChatDeletionComment} from "../validation";
import {ChatDeletionReason} from "../../api/types/response";
import {FormErrors} from "../../utils/types";
import {ApiError, ChatApi, getInitialApiErrorFromResponse} from "../../api";
import {EntitiesStore} from "../../entities-store";
import {DeleteChatRequest} from "../../api/types/request";
import {Routes} from "../../router";

export class DeleteChatStore {
    deleteChatForm: DeleteChatFormData = {
        reason: ChatDeletionReason.SPAM,
        comment: undefined
    };

    formErrors: FormErrors<DeleteChatFormData> = {
        reason: undefined,
        comment: undefined
    };

    currentStep: ChatDeletionStep = ChatDeletionStep.NONE;

    pending: boolean = false;

    error?: ApiError = undefined;

    showSnackbar: boolean = false;

    routerStore?: RouterStore<any>;

    get selectedChat(): ChatOfCurrentUserEntity | undefined {
        if (this.chatStore.selectedChatId) {
            return this.entities.chats.findById(this.chatStore.selectedChatId);
        }

        return undefined;
    }

    get deletionReasonRequired(): boolean {
        return Boolean(this.selectedChat) && !Boolean(this.selectedChat?.createdByCurrentUser)
    }

    constructor(private readonly entities: EntitiesStore,
                private readonly chatStore: ChatStore) {
        makeAutoObservable(this);

        reaction(
            () => this.deleteChatForm.reason,
            reason => this.formErrors.comment = validateChatDeletionComment(
                this.deleteChatForm.comment,
                reason
            )
        );

        reaction(
            () => this.deleteChatForm.comment,
            comment => this.formErrors.comment = validateChatDeletionComment(
                comment,
                this.deleteChatForm.reason
            )
        );
    }

    setRouterStore = (routerStore: RouterStore<any>): void => {
        this.routerStore = routerStore;
    };

    setCurrentStep = (step: ChatDeletionStep): void => {
        this.currentStep = step;
    };

    setFormValue = <Key extends keyof DeleteChatFormData>(key: Key, value: DeleteChatFormData[Key]): void => {
        this.deleteChatForm[key] = value;
    };

    deleteChat = (): void => {
        if (!this.selectedChat) {
            return;
        }

        if (this.deletionReasonRequired) {
            if (!this.validateForm()) {
                return;
            }
        }

        const chatId = this.selectedChat.id;
        this.pending = true;
        this.error = undefined;

        let requestData: DeleteChatRequest | undefined = undefined;

        if (this.deletionReasonRequired) {
            requestData = {
                ...this.deleteChatForm
            }
        }

        ChatApi.deleteChat(chatId, requestData)
            .then(() => {
                if (this.routerStore) {
                    this.routerStore.goTo(Routes.myChats);
                }

                this.entities.chats.deleteById(chatId);

                if (requestData) {
                    this.entities.chats.deleteById(chatId, {
                        deletionReason: requestData.reason,
                        deletionComment: requestData.comment
                    });
                }

                this.setShowSnackbar(true);
                this.setCurrentStep(ChatDeletionStep.NONE);
            })
            .catch(error => this.error = getInitialApiErrorFromResponse(error))
            .finally(() => this.pending = false);
    };

    validateForm = (): boolean => {
        this.formErrors.comment = validateChatDeletionComment(this.deleteChatForm.comment, this.deleteChatForm.reason);

        return !Boolean(this.formErrors.comment);
    };

    setShowSnackbar = (showSnackbar: boolean): void => {
        this.showSnackbar = showSnackbar;
    };
}
