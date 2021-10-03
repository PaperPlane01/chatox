import {action, computed, observable, reaction, runInAction} from "mobx";
import {UploadMessageAttachmentsStore} from "./UploadMessageAttachmentsStore";
import {CreateMessageFormData} from "../types";
import {validateMessageText} from "../validation";
import {ChatStore} from "../../Chat";
import {FormErrors} from "../../utils/types";
import {ApiError, ChatApi, getInitialApiErrorFromResponse, MessageApi} from "../../api";
import {EntitiesStore} from "../../entities-store";
import {Routes} from "../../router";

export class CreateMessageStore {
    @observable
    createMessageForm: CreateMessageFormData = {
        text: "",
        scheduledAt: undefined
    };

    @observable
    formErrors: FormErrors<CreateMessageFormData> = {
        text: undefined,
        scheduledAt: undefined
    };

    @observable
    pending: boolean = false;

    @observable
    submissionError?: ApiError = undefined;

    @observable
    referredMessageId?: string = undefined;

    @observable
    emojiPickerExpanded: boolean = false;

    @observable
    userId?: string = undefined;

    @computed
    get selectedChatId(): string | undefined {
        return this.chatStore.selectedChatId;
    };

    @computed
    get attachmentsIds(): string[] {
        return this.messageUploads.messageAttachmentsFiles
            .filter(fileContainer => fileContainer.uploadedFile !== undefined && fileContainer.uploadedFile !== null)
            .map(fileContainer => fileContainer.uploadedFile!.id!)
    };

    @computed
    get shouldSendReferredMessageId(): boolean {
        if (this.referredMessageId && this.selectedChatId) {
            const referredMessage = this.entitiesStore.messages.findById(this.referredMessageId);

            return referredMessage.chatId === this.selectedChatId;
        }

        return false;
    };

    private routerStore: any;

    constructor(
        private readonly chatStore: ChatStore,
        private readonly entitiesStore: EntitiesStore,
        private readonly messageUploads: UploadMessageAttachmentsStore
    ) {
        reaction(
            () => this.createMessageForm.text,
            text => this.formErrors.text = validateMessageText(text, {acceptEmpty: this.attachmentsIds.length !== 0})
        );
    };

    setRouterStore = (routerStore: any): void => {
        this.routerStore = routerStore;
    }

    @action
    setUserId = (userId?: string): void => {
        this.userId = userId;
    }

    @action
    setReferredMessageId = (referredMessageId?: string): void => {
        this.referredMessageId = referredMessageId;
    }

    @action
    setFormValue = <Key extends keyof CreateMessageFormData>(key: Key, value: CreateMessageFormData[Key]): void => {
        this.createMessageForm[key] = value;
    }

    @action
    sendSticker = (stickerId: string): void => {
        if (!this.selectedChatId || this.pending) {
            return;
        }

        this.pending = true;
        this.submissionError = undefined;

        MessageApi.createMessage(this.selectedChatId, {
            text: "",
            referredMessageId: this.referredMessageId,
            uploadAttachments: [],
            stickerId
        })
            .then(({data}) => this.entitiesStore.insertMessage(data))
            .catch(error => runInAction(() => this.submissionError = getInitialApiErrorFromResponse(error)))
            .finally(() => runInAction(() => this.pending = false));
    }

    @action
    createMessage = (): void => {
        if (!this.selectedChatId ) {
            if (!this.userId) {
                return;
            }
        }

        if (!this.validateForm()) {
            return;
        }

        this.pending = true;
        this.submissionError = undefined;

        if (this.selectedChatId) {
            const chatId = this.selectedChatId;
            MessageApi.createMessage(chatId, {
                text: this.createMessageForm.text,
                referredMessageId: this.shouldSendReferredMessageId ? this.referredMessageId : undefined,
                uploadAttachments: this.attachmentsIds,
                scheduledAt: this.createMessageForm.scheduledAt ? this.createMessageForm.scheduledAt.toISOString() : undefined
            })
                .then(({data}) => {
                    if (!this.createMessageForm.scheduledAt) {
                        this.entitiesStore.insertMessage(data);
                    } else {
                        if (this.routerStore && this.routerStore.router && this.routerStore.router.goTo) {
                            const chat = this.entitiesStore.chats.findById(chatId);
                            this.routerStore.router.goTo(Routes.scheduledMessagesPage, {
                                slug: chat.slug ? chat.slug : chatId
                            });
                        }
                    }

                    this.resetForm();
                })
                .catch(error => runInAction(() => this.submissionError = getInitialApiErrorFromResponse(error)))
                .finally(() => runInAction(() => this.pending = false))
        } else if (this.userId) {
            const userId = this.userId;
            ChatApi.startPrivateChat({
                userId,
                message: {
                    text: this.createMessageForm.text,
                    referredMessageId: this.shouldSendReferredMessageId ? this.referredMessageId : undefined,
                    uploadAttachments: this.attachmentsIds,
                    scheduledAt: this.createMessageForm.scheduledAt ? this.createMessageForm.scheduledAt.toISOString() : undefined
                }
            })
                .then(({data}) => {
                    this.entitiesStore.insertChat(data);

                    if (this.routerStore && this.routerStore.router.goTo) {
                        this.routerStore.router.goTo(Routes.chatPage, {
                            slug: data.id
                        }, {}, {});
                    }
                })
                .catch(error => runInAction(() => this.submissionError = getInitialApiErrorFromResponse(error)))
                .finally(() => runInAction(() => this.pending = false))
        }
    }

    @action
    validateForm = (): boolean => {
        this.formErrors = {
            ...this.formErrors,
            text: validateMessageText(this.createMessageForm.text, {
                acceptEmpty: this.attachmentsIds.length !== 0
            })
        };

        return !this.formErrors.text;
    }

    @action
    resetForm = (): void => {
        this.createMessageForm = {
            text: ""
        };
        this.referredMessageId = undefined;
        this.messageUploads.reset();
        setTimeout(() => {
            this.formErrors = {
                text: undefined
            }
        })
    };

    @action
    setEmojiPickerExpanded = (emojiPickerExpanded: boolean): void => {
        this.emojiPickerExpanded = emojiPickerExpanded;
    }
}
