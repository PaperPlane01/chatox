import {action, computed, makeObservable, observable, reaction} from "mobx";
import {computedFn} from "mobx-utils";
import {RouterStore} from "mobx-router";
import {debounce} from "lodash";
import {AbstractMessageFormStore} from "./AbstractMessageFormStore";
import {UploadMessageAttachmentsStore} from "./UploadMessageAttachmentsStore";
import {RecordVoiceMessageStore} from "./RecordVoiceMessageStore";
import {CreateMessageFormData} from "../types";
import {ForwardMessagesStore} from "../../Message";
import {ChatsPreferencesStore, ChatStore} from "../../Chat";
import {ChatApi, getInitialApiErrorFromResponse, MessageApi} from "../../api";
import {EntitiesStore} from "../../entities-store";
import {RouterStoreAware, Routes} from "../../router";
import {FormErrors} from "../../utils/types";
import {createWithUndefinedValues, isDefined} from "../../utils/object-utils";
import {Duration} from "../../utils/date-utils";
import {isStringEmpty} from "../../utils/string-utils";
import {MessageEntity} from "../../Message/types";

const INITIAL_FORM_VALUES: CreateMessageFormData = {
    text: "",
    scheduledAt: undefined,
    referredMessageId: undefined
};
const INITIAL_FORM_ERRORS: FormErrors<CreateMessageFormData> = createWithUndefinedValues(INITIAL_FORM_VALUES);

export class CreateMessageStore extends AbstractMessageFormStore<CreateMessageFormData> implements RouterStoreAware {
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

    lastMessageDates = observable.map<string, Date>();

    constructor(chatStore: ChatStore,
                messageUploads: UploadMessageAttachmentsStore,
                entities: EntitiesStore,
                private readonly chatsPreferences: ChatsPreferencesStore,
                private readonly forwardMessagesStore: ForwardMessagesStore,
                private readonly recordVoiceMessageStore: RecordVoiceMessageStore) {
        super(INITIAL_FORM_VALUES, INITIAL_FORM_ERRORS, chatStore, messageUploads, entities);

        this.startTyping = debounce(this.startTyping, 300);

        makeObservable<CreateMessageStore>(this, {
            referredMessageId: observable,
            userId: observable,
            shouldSendReferredMessageId: computed,
            submitForm: action,
            setUserId: action,
            setReferredMessageId: action,
            sendSticker: action,
            setLastMessageDateForChat: action
        });

        reaction(
            () => this.formValues.text,
            text => {
                if (text.length !== 0 && this.chatsPreferences.sendTypingNotification) {
                    this.startTyping();
                }
            }
        );
    };

    setRouterStore = (routerStore: RouterStore<any>): void => {
        this.routerStore = routerStore;
    }

    setUserId = (userId?: string): void => {
        this.userId = userId;
    }

    setReferredMessageId = (referredMessageId?: string): void => {
        this.referredMessageId = referredMessageId;
    }

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
            .then(({data}) => {
                const message = this.entities.messages.insert(data);
                this.setLastMessageDateForChat(data.chatId, message.createdAt);
                this.sendForwardedMessages(data.chatId);
            })
            .catch(error => this.setError(getInitialApiErrorFromResponse(error)))
            .finally(() => this.setPending(false));
    }

    startTyping = (): void => {
        if (!this.selectedChatId) {
            return;
        }

        ChatApi.startTyping(this.selectedChatId);
    }

    submitForm = (): void => {
        if (!this.selectedChatId && !this.userId) {
            return;
        }

        if (this.selectedChatId
            && this.forwardMessagesStore.forwardModeActive
            && isStringEmpty(this.formValues.text)
            && this.attachmentsIds.length === 0) {
            this.sendForwardedMessages(this.selectedChatId);
            return;
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
                    this.recordVoiceMessageStore.cleanRecording();
                    const message = this.formValues.scheduledAt
                        ? this.entities.scheduledMessages.insert(data)
                        : this.entities.messages.insert(data);
                    this.setResultMessage(message);

                    if (!this.formValues.scheduledAt) {
                        this.setResultMessage(message);
                        this.setLastMessageDateForChat(data.chatId, message.createdAt);

                        if (this.forwardMessagesStore.forwardModeActive) {
                            this.sendForwardedMessages(chatId);
                        }
                    } else if (this.routerStore) {
                        const chat = this.entities.chats.findById(chatId);
                        this.routerStore.goTo(Routes.scheduledMessagesPage, {
                            slug: chat.slug ? chat.slug : chatId
                        });
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

                    if (data.lastMessage) {
                        this.setResultMessage(this.entities.messages.findById(data.lastMessage.id));
                    }

                    if (this.routerStore) {
                        this.routerStore.goTo(Routes.chatPage, {
                            slug: data.id
                        }, {});
                    }
                })
                .catch(error => this.setError(getInitialApiErrorFromResponse(error)))
                .finally(() => this.setPending(false))
        }
    }

    private sendForwardedMessages = (chatId: string): void => {
        if (this.forwardMessagesStore.forwardModeActive) {
            this.forwardMessagesStore.forwardMessages().then(date => {
                if (date) {
                    this.setLastMessageDateForChat(chatId, date);
                }
            })
        }
    }

    getNextMessageDate = computedFn((chatId: string) => {
        const lastMessageDate = this.lastMessageDates.get(chatId);

        if (!isDefined(lastMessageDate)) {
            return undefined;
        }

        const chat = this.entities.chats.findByIdOptional(chatId);

        if (!isDefined(chat) || !isDefined(chat.slowMode) || !chat.slowMode.enabled) {
            return undefined;
        }

        return Duration.of(chat.slowMode.interval, chat.slowMode.unit)
            .addToDate(lastMessageDate);
    })

    setLastMessageDateForChat = (chatId: string, date: Date): void => {
        const chat = this.entities.chats.findByIdOptional(chatId);

        if (!chat || !isDefined(chat.slowMode) || !chat.slowMode.enabled) {
            return;
        }

        this.lastMessageDates.set(chatId, date);
    }
}
