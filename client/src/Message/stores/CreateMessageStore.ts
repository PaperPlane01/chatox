import {makeAutoObservable, reaction, runInAction} from "mobx";
import {UploadMessageAttachmentsStore} from "./UploadMessageAttachmentsStore";
import {CreateMessageFormData} from "../types";
import {validateMessageText} from "../validation";
import {ChatStore} from "../../Chat";
import {FormErrors} from "../../utils/types";
import {ApiError, ChatApi, getInitialApiErrorFromResponse, MessageApi} from "../../api";
import {EntitiesStore} from "../../entities-store";
import {Routes} from "../../router";
import {RouterStore} from "mobx-router";

export class CreateMessageStore {
    createMessageForm: CreateMessageFormData = {
        text: "",
        scheduledAt: undefined
    };

    formErrors: FormErrors<CreateMessageFormData> = {
        text: undefined,
        scheduledAt: undefined
    };

    pending: boolean = false;

    submissionError?: ApiError = undefined;

    referredMessageId?: string = undefined;

    emojiPickerExpanded: boolean = false;

    userId?: string = undefined;

    get selectedChatId(): string | undefined {
        return this.chatStore.selectedChatId;
    };

    get attachmentsIds(): string[] {
        return this.messageUploads.messageAttachmentsFiles
            .filter(fileContainer => fileContainer.uploadedFile !== undefined && fileContainer.uploadedFile !== null)
            .map(fileContainer => fileContainer.uploadedFile!.id!)
    };

    get shouldSendReferredMessageId(): boolean {
        if (this.referredMessageId && this.selectedChatId) {
            const referredMessage = this.entities.messages.findById(this.referredMessageId);

            return referredMessage.chatId === this.selectedChatId;
        }

        return false;
    };

    private routerStore: RouterStore<any>;

    constructor(private readonly chatStore: ChatStore,
                private readonly entities: EntitiesStore,
                private readonly messageUploads: UploadMessageAttachmentsStore) {
        makeAutoObservable(this);

        reaction(
            () => this.createMessageForm.text,
            text => runInAction(() => {
                this.formErrors.text = validateMessageText(text, {acceptEmpty: this.attachmentsIds.length !== 0});
            })
        );
    };

    setRouterStore = (routerStore: RouterStore<any>): void => {
        this.routerStore = routerStore;
    }

    setUserId = (userId?: string): void => {
        this.userId = userId;
    };

    setReferredMessageId = (referredMessageId?: string): void => {
        this.referredMessageId = referredMessageId;
    };

    setFormValue = <Key extends keyof CreateMessageFormData>(key: Key, value: CreateMessageFormData[Key]): void => {
        this.createMessageForm[key] = value;
    };

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
            .then(({data}) => this.entities.messages.insert(data))
            .catch(error => runInAction(() => this.submissionError = getInitialApiErrorFromResponse(error)))
            .finally(() => runInAction(() => this.pending = false));
    };

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
                        this.entities.messages.insert(data);
                    } else {
                        if (this.routerStore) {
                            const chat = this.entities.chats.findById(chatId);
                            this.routerStore.goTo(Routes.scheduledMessagesPage, {
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
                    this.entities.chats.insert(data);

                    if (this.routerStore) {
                        this.routerStore.goTo(Routes.chatPage, {
                            slug: data.id
                        }, {});
                    }
                })
                .catch(error => runInAction(() => this.submissionError = getInitialApiErrorFromResponse(error)))
                .finally(() => runInAction(() => this.pending = false))
        }
    };

    validateForm = (): boolean => {
        this.formErrors = {
            ...this.formErrors,
            text: validateMessageText(this.createMessageForm.text, {
                acceptEmpty: this.attachmentsIds.length !== 0
            })
        };

        return !this.formErrors.text;
    };

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

    setEmojiPickerExpanded = (emojiPickerExpanded: boolean): void => {
        this.emojiPickerExpanded = emojiPickerExpanded;
    };
}
