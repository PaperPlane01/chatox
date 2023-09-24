import {action, computed, makeObservable, observable, reaction} from "mobx";
import {RouterStore} from "mobx-router";
import {debounce} from "lodash";
import {AbstractMessageFormStore} from "./AbstractMessageFormStore";
import {UploadMessageAttachmentsStore} from "./UploadMessageAttachmentsStore";
import {CreateMessageFormData} from "../types";
import {ChatsPreferencesStore, ChatStore} from "../../Chat";
import {FormErrors} from "../../utils/types";
import {ChatApi, getInitialApiErrorFromResponse, MessageApi} from "../../api";
import {EntitiesStore} from "../../entities-store";
import {Routes} from "../../router";
import {createWithUndefinedValues} from "../../utils/object-utils";

const INITIAL_FORM_VALUES: CreateMessageFormData = {
    text: "",
    scheduledAt: undefined,
    referredMessageId: undefined
};
const INITIAL_FORM_ERRORS: FormErrors<CreateMessageFormData> = createWithUndefinedValues(INITIAL_FORM_VALUES);

export class CreateMessageStore extends AbstractMessageFormStore<CreateMessageFormData> {
    referredMessageId?: string = undefined;

    userId?: string = undefined;

    get shouldSendReferredMessageId(): boolean {
        if (this.referredMessageId && this.selectedChatId) {
            const referredMessage = this.entities.messages.findById(this.referredMessageId);

            return referredMessage.chatId === this.selectedChatId;
        }

        return false;
    };

    private routerStore: RouterStore<any>;

    constructor(chatStore: ChatStore,
                messageUploads: UploadMessageAttachmentsStore,
                entities: EntitiesStore,
                private readonly chatsPreferences: ChatsPreferencesStore) {
        super(INITIAL_FORM_VALUES, INITIAL_FORM_ERRORS, chatStore, messageUploads, entities);

        makeObservable<CreateMessageStore>(this, {
            referredMessageId: observable,
            userId: observable,
            shouldSendReferredMessageId: computed,
            submitForm: action,
            setUserId: action,
            setReferredMessageId: action,
            sendSticker: action
        });

        reaction(
            () => this.formValues.text,
            text => {
                if (text.length !== 0 && this.chatsPreferences.sendTypingNotification) {
                    this.startTyping();
                }
            }
        );

        this.startTyping = debounce(this.startTyping, 300);
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

    sendSticker = (stickerId: string): void => {
        if (!this.selectedChatId || this.pending) {
            return;
        }

        this.pending = true;
        this.error = undefined;

        MessageApi.createMessage(this.selectedChatId, {
            text: "",
            referredMessageId: this.referredMessageId,
            uploadAttachments: [],
            stickerId
        })
            .then(({data}) => this.entities.messages.insert(data))
            .catch(error => this.setError(getInitialApiErrorFromResponse(error)))
            .finally(() => this.setPending(false));
    };

    startTyping = (): void => {
        if (!this.selectedChatId) {
            return;
        }

        ChatApi.startTyping(this.selectedChatId);
    }

    submitForm = (): void => {
        if (!this.selectedChatId ) {
            if (!this.userId) {
                return;
            }
        }

        if (!this.validateForm()) {
            return;
        }

        this.pending = true;
        this.error = undefined;

        if (this.selectedChatId) {
            const chatId = this.selectedChatId;
            MessageApi.createMessage(chatId, {
                text: this.formValues.text,
                referredMessageId: this.shouldSendReferredMessageId ? this.referredMessageId : undefined,
                uploadAttachments: this.attachmentsIds,
                scheduledAt: this.formValues.scheduledAt ? this.formValues.scheduledAt.toISOString() : undefined
            })
                .then(({data}) => {
                    if (!this.formValues.scheduledAt) {
                        this.entities.messages.insert(data);
                    } else {
                        if (this.routerStore) {
                            const chat = this.entities.chats.findById(chatId);
                            this.routerStore.goTo(Routes.scheduledMessagesPage, {
                                slug: chat.slug ? chat.slug : chatId
                            });
                        }
                    }

                    this.reset();
                })
                .catch(error => this.setError(getInitialApiErrorFromResponse(error)))
                .finally(() => this.setPending(false))
        } else if (this.userId) {
            const userId = this.userId;
            ChatApi.startPrivateChat({
                userId,
                message: {
                    text: this.formValues.text,
                    referredMessageId: this.shouldSendReferredMessageId ? this.referredMessageId : undefined,
                    uploadAttachments: this.attachmentsIds,
                    scheduledAt: this.formValues.scheduledAt ? this.formValues.scheduledAt.toISOString() : undefined
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
                .catch(error => this.setError(getInitialApiErrorFromResponse(error)))
                .finally(() => this.setPending(false))
        }
    };
}
