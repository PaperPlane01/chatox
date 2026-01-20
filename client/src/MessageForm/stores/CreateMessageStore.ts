import {action, computed, makeObservable, observable, reaction} from "mobx";
import {computedFn} from "mobx-utils";
import {RouterStore} from "mobx-router";
import {debounce} from "lodash";
import {v4} from "uuid";
import {AbstractMessageFormStore} from "./AbstractMessageFormStore";
import {UploadMessageAttachmentsStore} from "./UploadMessageAttachmentsStore";
import {RecordVoiceMessageStore} from "./RecordVoiceMessageStore";
import {CreateMessageFormData} from "../types";
import {ForwardMessagesStore, MessageEntity} from "../../Message";
import {ChatsPreferencesStore, ChatStore} from "../../Chat";
import {ChatApi, getInitialApiErrorFromResponse, MessageApi, UploadApi} from "../../api";
import {CurrentUser, Upload, UploadType} from "../../api/types/response";
import {CreateMessageRequest} from "../../api/types/request";
import {EntitiesStore} from "../../entities-store";
import {RouterStoreAware, Routes} from "../../router";
import {FormErrors} from "../../utils/types";
import {createWithUndefinedValues, isDefined} from "../../utils/object-utils";
import {Duration} from "../../utils/date-utils";
import {isStringEmpty} from "../../utils/string-utils";
import {UploadedFileContainer} from "../../utils/file-utils";
import {UploadCacheService} from "../../Upload";
import {AuthorizationStore} from "../../Authorization";
import {splitUploads} from "../../Message/utils";
import {DraftMessageRepository} from "../../Message/repositories";

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

    get currentUser(): CurrentUser | undefined {
        return this.authorization.currentUser;
    }

    get selectedChatDraftMessageId(): string | undefined {
        if (!this.selectedChatId) {
            return undefined;
        }

        return this.entities.chats.findById(this.selectedChatId).draftMessageId;
    }

    get selectedChatDraftMessage(): MessageEntity | undefined {
        if (!this.selectedChatDraftMessageId) {
            return undefined;
        }

        return this.entities.draftMessages.findByIdOptional(this.selectedChatDraftMessageId);
    }

    get selectedChatDraftMessageUploads(): Array<Upload<any>> {
        if (!this.selectedChatDraftMessage) {
            return [];
        }

        if (this.selectedChatDraftMessage.uploads.length === 0) {
            return [];
        }

        return this.entities.uploads.findAllById(this.selectedChatDraftMessage.uploads);
    }

    get isFormEmpty(): boolean {
        return (this.formValues.text ?? "").length === 0 && this.messageUploads.messageAttachmentsFiles.length === 0;
    }

    private routerStore: RouterStore<any>;

    lastMessageDates = observable.map<string, Date>();

    pendingDraftMessagesMap = observable.map<string, boolean>();

    pendingDraftMessageUploadRestoreMap = observable.map<string, boolean>();

    draftMessageConsumed = true;

    constructor(chatStore: ChatStore,
                messageUploads: UploadMessageAttachmentsStore,
                entities: EntitiesStore,
                private readonly chatsPreferences: ChatsPreferencesStore,
                private readonly forwardMessagesStore: ForwardMessagesStore,
                private readonly recordVoiceMessageStore: RecordVoiceMessageStore,
                private readonly authorization: AuthorizationStore,
                private readonly uploadCacheService: UploadCacheService,
                private readonly draftMessageRepository: DraftMessageRepository) {
        super(INITIAL_FORM_VALUES, INITIAL_FORM_ERRORS, chatStore, messageUploads, entities);

        this.startTyping = debounce(this.startTyping, 300);

        makeObservable<CreateMessageStore>(this, {
            referredMessageId: observable,
            userId: observable,
            draftMessageConsumed: observable,
            shouldSendReferredMessageId: computed,
            currentUser: computed,
            isFormEmpty: computed,
            selectedChatDraftMessage: computed,
            selectedChatDraftMessageId: computed,
            selectedChatDraftMessageUploads: computed,
            submitForm: action,
            setUserId: action,
            setReferredMessageId: action,
            sendSticker: action,
            setLastMessageDateForChat: action,
            setDraftMessageConsumed: action
        });

        reaction(
            () => this.formValues.text,
            text => {
                if (this.formTouched && text.length !== 0 && this.chatsPreferences.sendTypingNotification) {
                    this.startTyping();
                }
            }
        );

        reaction(
            () => chatStore.selectedChat,
            selectedChat => {
                if (chatStore.previousChatId) {
                    const chat = this.entities.chats.findById(chatStore.previousChatId);

                    if (this.validateForm()) {
                        console.log("creating draft message")
                        this.createDraftMessageForChat(
                            chatStore.previousChatId,
                            this.formValues,
                            this.messageUploads.messageAttachmentsFiles,
                            this.referredMessageId,
                            chat.draftMessageId
                        );
                    } else if (this.isFormEmpty && chat.draftMessageId) {
                        const draftMessage = this.entities.draftMessages.findById(chat.draftMessageId);
                        const uploads = this.entities.uploads.findAllById(draftMessage.uploads);
                        this.cleanupDraftMessage(draftMessage, uploads);
                    }
                }

                this.reset();
                this.messageUploads.reset();

                if (selectedChat) {
                    this.restoreFromDraftMessage(selectedChat.id);
                }
            }
        );

        reaction(
            () => this.selectedChatDraftMessage?.text,
            text => {
                if (!text || !this.selectedChatId) {
                    return;
                }

                this.restoreFromDraftMessage(this.selectedChatId);
            }
        );

        reaction(
            () => this.selectedChatDraftMessage?.uploads,
            uploads => {
                if (!uploads || !this.selectedChatId) {
                    return;
                }

                this.restoreFromDraftMessage(this.selectedChatId);
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

    sendSticker = (stickerId: string, clearTextAfter: boolean = false): void => {
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

                if (clearTextAfter) {
                    this.setResultMessage(message);
                    this.setFormValue("text", "");
                }
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

    setDraftMessageConsumed = (draftMessageConsumed: boolean): void => {
        this.draftMessageConsumed = draftMessageConsumed;
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
            this.createMessageForChat(this.selectedChatId, this.selectedChatDraftMessage, this.selectedChatDraftMessageUploads);
        } else if (this.userId) {
            this.createFirstMessageForPrivateChat(this.userId);
        }
    }

    private createMessageForChat = (
        chatId: string,
        draftMessage?: MessageEntity,
        draftMessageUploads?: Array<Upload<any>>
    ): void => {
        MessageApi.createMessage(chatId, {
            text: this.formValues.text,
            referredMessageId: this.shouldSendReferredMessageId ? this.referredMessageId : undefined,
            uploadAttachments: this.attachmentsIds,
            scheduledAt: this.formValues.scheduledAt ? this.formValues.scheduledAt.toISOString() : undefined
        })
            .then(({data}) => {
                this.cleanupDraftMessage(draftMessage, draftMessageUploads, true);
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
    }

    private cleanupDraftMessage = async (
        draftMessage?: MessageEntity,
        draftMessageUploads?: Array<Upload<any>>,
        skipDeletingRemote: boolean = false
    ): Promise<void> => {
        if (!draftMessage) {
            return;
        }

        await this.draftMessageRepository.deleteById(draftMessage.id);
        const chat = this.entities.chats.findByIdOptional(draftMessage.chatId);

        if (chat) {
            chat.draftMessageId = undefined;
            this.entities.chats.insertEntity(chat);
        }

        this.entities.draftMessages.deleteById(draftMessage.id, {hardDelete: true});

        if (draftMessageUploads && draftMessageUploads.length !== 0) {
            await this.cleanupDraftMessageUploads(draftMessageUploads);
        }

        if (!draftMessage.local && !skipDeletingRemote) {
            await MessageApi.deleteDraftMessage(draftMessage.chatId);
        }
    }

    private cleanupDraftMessageUploads = async (uploads: Array<Upload<any>>): Promise<void> => {
        for (let upload of uploads) {
            if (!upload.localId) {
                continue;
            }

            await this.uploadCacheService.deleteLocalFileFromCache(upload.localId, upload.type);
        }
    }

    private createFirstMessageForPrivateChat = (userId: string): void => {
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

    private sendForwardedMessages = (chatId: string): void => {
        if (this.forwardMessagesStore.forwardModeActive) {
            this.forwardMessagesStore.forwardMessages().then(date => {
                if (date) {
                    this.setLastMessageDateForChat(chatId, date);
                }
            })
        }
    }

    private createDraftMessageForChat = async (
        chatId: string,
        formData: CreateMessageFormData,
        uploadAttachments: UploadedFileContainer[],
        referredMessageId?: string,
        updatedDraftMessageId?: string
    ): Promise<void> => {
        this.pendingDraftMessagesMap.set(chatId, true);

        if (this.chatsPreferences.saveDraftMessagesToServer) {
           try {
               await this.createRemoteDraftMessage(
                   chatId,
                   formData,
                   uploadAttachments,
                   referredMessageId
               );
           } catch (error) {
               await this.createOrUpdateLocalDraftMessage(
                   chatId,
                   formData,
                   uploadAttachments,
                   referredMessageId,
                   updatedDraftMessageId
               )
           }
        } else {
            await this.createOrUpdateLocalDraftMessage(
                chatId,
                formData,
                uploadAttachments,
                referredMessageId,
                updatedDraftMessageId
            );
        }

        this.pendingDraftMessagesMap.set(chatId, false);
    }

    private createRemoteDraftMessage = async (
        chatId: string,
        formData: CreateMessageFormData,
        uploadAttachments: UploadedFileContainer[],
        referredMessageId?: string
    ): Promise<void> => {
        const request: CreateMessageRequest = {
            text: formData.text,
            uploadAttachments: uploadAttachments
                .filter(uploadAttachment => isDefined(uploadAttachment.uploadedFile))
                .map(uploadAttachment => uploadAttachment.uploadedFile!.id),
            referredMessageId,
            draft: true
        };
        this.pendingDraftMessagesMap.set(chatId, true);

        const {data} = await MessageApi.createMessage(chatId, request);
        this.entities.draftMessages.insert(data, {setDraftMessageToChat: true});
    }

    private createOrUpdateLocalDraftMessage = async (
        chatId: string,
        formData: CreateMessageFormData,
        uploadAttachments: UploadedFileContainer[],
        referredMessageId?: string,
        updatedDraftMessageId?: string
    ): Promise<void> => {
        if (!this.currentUser) {
            return;
        }

        await Promise.all(
            uploadAttachments.map(upload =>
                this.uploadCacheService.saveLocalFileToCache(upload))
        );
        const uploads = uploadAttachments.map(uploadAttachment => uploadAttachment.toUpload());
        const {images, audios, videos, voiceMessages, files, allUploads} = splitUploads(uploads);

        if (updatedDraftMessageId) {
            const draftMessage = this.entities.draftMessages.findById(updatedDraftMessageId);
            this.entities.uploads.insertAllEntities(uploads);
            this.entities.draftMessages.insertEntity({
                ...draftMessage,
                text: formData.text,
                uploads: allUploads,
                images,
                videos,
                voiceMessages,
                files,
                audios,
                imagesCount: images.length,
                videosCount: videos.length,
                filesCount: files.length,
                audiosCount: audios.length,
                voiceMessagesCount: voiceMessages.length
            });
        } else {
            const draftMessage: MessageEntity = {
                id: v4(),
                text: formData.text,
                referredMessageId,
                sender: this.currentUser.id,
                deleted: false,
                messageDeleted: false,
                createdAt: new Date(),
                readByCurrentUser: true,
                readByAnyone: false,
                chatId,
                emoji: {
                    emoji: {},
                    emojiPositions: []
                },
                uploads: allUploads,
                mentionedUsers: [],
                images,
                videos,
                voiceMessages,
                files,
                audios,
                imagesCount: images.length,
                videosCount: videos.length,
                voiceMessagesCount: voiceMessages.length,
                filesCount: files.length,
                audiosCount: audios.length,
                index: -1,
                local: true,
                forwarded: false
            };

            this.entities.uploads.insertAllEntities(uploads);
            this.entities.draftMessages.insertEntity(draftMessage);

            const chat = this.entities.chats.findById(chatId);
            chat.draftMessageId = draftMessage.id;
            this.entities.chats.insertEntity(chat);
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

    isRestoringUploads = (chatId: string): boolean => {
        return this.pendingDraftMessageUploadRestoreMap.get(chatId) ?? false;
    }

    private restoreFromDraftMessage(chatId: string): void {
        const chat = this.entities.chats.findByIdOptional(chatId);

        if (!chat?.draftMessageId) {
            return;
        }

        const draftMessage = this.entities.draftMessages.findById(chat.draftMessageId);
        this.setForm(
            {
                text: draftMessage.text,
                referredMessageId: draftMessage.referredMessageId
            },
            false
        );

        this.restoreUploadsForDraftMessage(draftMessage);
        this.setDraftMessageConsumed(false);
    }

    private async restoreUploadsForDraftMessage(draftMessage: MessageEntity): Promise<void>{
        if (this.isRestoringUploads(draftMessage.chatId) || draftMessage.uploads.length === 0) {
            return;
        }

        this.pendingDraftMessageUploadRestoreMap.set(draftMessage.chatId, true);
        const uploads = this.entities.uploads.findAllById(draftMessage.uploads);

        if (draftMessage.local) {
           await this.restoreUploadsForLocalDraftMessage(uploads, draftMessage.chatId);
        } else {
            this.restoreUploadsForRemoteDraftMessage(uploads, draftMessage.chatId);
        }

        this.pendingDraftMessageUploadRestoreMap.set(draftMessage.chatId, false);
    }

    private async restoreUploadsForLocalDraftMessage(uploads: Array<Upload<any>>, chatId: string): Promise<void> {
        const {data: uploadsInfo} = await UploadApi.getUploadsInfoByIds(uploads.map(upload => upload.id));
        const uploadedFileContainers: UploadedFileContainer[] = [];

        if (uploadsInfo.length === uploads.length) {
           uploadedFileContainers.push(...uploads.map(upload => new UploadedFileContainer(
               null,
               upload.type,
               false,
               upload.localId,
               upload
           )));
            this.messageUploads.setMessageAttachmentsFiles(uploadedFileContainers, chatId);
        } else {
            const presentUploadsMap = new Map(uploadsInfo.map(upload => [upload.id, upload]));
            const missingUploads = uploads
                .filter(upload => isDefined(upload.localId) && !presentUploadsMap.has(upload.id));
            const retryUploadMap = await this.restoreUploadsFromCache(missingUploads);

            this.messageUploads.setMessageAttachmentsFiles([...presentUploadsMap.values()].map(upload => new UploadedFileContainer(
                null,
                upload.type,
                false,
                upload.localId,
                upload
            )));

            if (retryUploadMap.size !== 0) {
                this.reuploadAttachments(retryUploadMap);
            }
        }
    }

    private async restoreUploadsFromCache(uploads: Array<Upload<any>>): Promise<Map<UploadType, Array<UploadedFileContainer>>> {
        const retryUploadMap = new Map<UploadType, Array<UploadedFileContainer>>();

        if (uploads.length === 0) {
            return retryUploadMap;
        }

        for (let missingUpload of uploads) {
            const cachedBlob = await this.uploadCacheService.getLocalFileFromCache(missingUpload.localId!, missingUpload.type);

            if (!cachedBlob) {
                continue;
            }

            const cachedFile = new File([cachedBlob], missingUpload.name);
            const fileContainer = new UploadedFileContainer(
                cachedFile,
                missingUpload.type,
                false,
                missingUpload.id
            );

            if (retryUploadMap.has(missingUpload.type)) {
                retryUploadMap.get(missingUpload.type)!.push(fileContainer);
            } else {
                retryUploadMap.set(missingUpload.type, [fileContainer]);
            }
        }

        return retryUploadMap;
    }

    private reuploadAttachments(retryUploadMap: Map<UploadType, Array<UploadedFileContainer>>): void {
        for (let [uploadType, fileContainers] of retryUploadMap) {
            switch (uploadType) {
                case UploadType.IMAGE:
                case UploadType.GIF:
                    this.messageUploads.attachImageContainers(fileContainers);
                    break;
                case UploadType.AUDIO:
                    this.messageUploads.attachAudioContainers(fileContainers);
                    break;
                case UploadType.VOICE_MESSAGE:
                    this.messageUploads.attachVoiceMessagesContainers(fileContainers);
                    break;
                case UploadType.VIDEO:
                    this.messageUploads.attachVideoContainers(fileContainers);
                    break;
                case UploadType.FILE:
                default:
                    this.messageUploads.attachAnyFileContainers(fileContainers);
                    break;
            }
        }
    }

    private restoreUploadsForRemoteDraftMessage(uploads: Array<Upload<any>>, chatId?: string): void {
        const uploadedFileContainers = uploads.map(upload => new UploadedFileContainer(
            undefined,
            upload.type,
            false,
            undefined,
            upload
        ));
        this.messageUploads.setMessageAttachmentsFiles(uploadedFileContainers, chatId);
    }
}
