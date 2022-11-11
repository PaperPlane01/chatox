import {action, computed, observable, reaction} from "mobx";
import {ChatStore} from "./ChatStore";
import {ChatDeletionStep, ChatOfCurrentUserEntity, DeleteChatFormData} from "../types";
import {validateChatDeletionComment} from "../validation";
import {ChatDeletionReason} from "../../api/types/response";
import {FormErrors} from "../../utils/types";
import {ApiError, ChatApi, getInitialApiErrorFromResponse} from "../../api";
import {EntitiesStore} from "../../entities-store";
import {DeleteChatRequest} from "../../api/types/request";

export class DeleteChatStore {
    @observable
    deleteChatForm: DeleteChatFormData = {
        reason: ChatDeletionReason.SPAM,
        comment: undefined
    }

    @observable
    formErrors: FormErrors<DeleteChatFormData> = {
        reason: undefined,
        comment: undefined
    }

    @observable
    currentStep: ChatDeletionStep = ChatDeletionStep.NONE;

    @observable
    pending: boolean = false;

    @observable
    error?: ApiError = undefined;

    @observable
    showSnackbar: boolean = false;

    @computed
    get selectedChat(): ChatOfCurrentUserEntity | undefined {
        if (this.chatStore.selectedChatId) {
            return this.entities.chats.findById(this.chatStore.selectedChatId);
        }

        return undefined;
    }

    @computed
    get deletionReasonRequired(): boolean {
        return Boolean(this.selectedChat) && !Boolean(this.selectedChat?.createdByCurrentUser)
    }

    @computed
    get chatDeletionDialogOpen(): boolean {
        return this.currentStep !== ChatDeletionStep.NONE;
    }

    constructor(private readonly entities: EntitiesStore,
                private readonly chatStore: ChatStore) {
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

    @action
    setCurrentStep = (step: ChatDeletionStep): void => {
        this.currentStep = step;
    }

    @action
    setFormValue = <Key extends keyof DeleteChatFormData>(key: Key, value: DeleteChatFormData[Key]): void => {
        this.deleteChatForm[key] = value;
    }

    @action
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
    }

    @action
    validateForm = (): boolean => {
        this.formErrors.comment = validateChatDeletionComment(this.deleteChatForm.comment, this.deleteChatForm.reason);

        return !Boolean(this.formErrors.comment);
    }

    @action
    setShowSnackbar = (showSnackbar: boolean): void => {
        this.showSnackbar = showSnackbar;
    }
}
