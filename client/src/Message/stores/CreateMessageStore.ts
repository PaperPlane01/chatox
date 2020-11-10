import {action, reaction, observable, computed} from "mobx";
import {CreateMessageFormData} from "../types";
import {validateMessageText} from "../validation";
import {ChatStore} from "../../Chat";
import {FormErrors} from "../../utils/types";
import {MessageApi, ApiError, getInitialApiErrorFromResponse} from "../../api";
import {EntitiesStore} from "../../entities-store";
import {UploadMessageAttachmentsStore} from "./UploadMessageAttachmentsStore";

export class CreateMessageStore {
    @observable
    createMessageForm: CreateMessageFormData = {
        text: ""
    };

    @observable
    formErrors: FormErrors<CreateMessageFormData> = {
        text: undefined
    };

    @observable
    pending: boolean = false;

    @observable
    submissionError?: ApiError = undefined;

    @observable
    referredMessageId?: string = undefined;

    @observable
    emojiPickerExpanded: boolean = false;

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

    constructor(
        private readonly chatStore: ChatStore,
        private readonly entitiesStore: EntitiesStore,
        private readonly messageUploads: UploadMessageAttachmentsStore
    ) {
        reaction(
            () => this.createMessageForm.text,
            text => this.formErrors.text = validateMessageText(text, {acceptEmpty: this.attachmentsIds.length !== 0})
        )
    };

    @action
    setReferredMessageId = (referredMessageId?: string): void => {
        this.referredMessageId = referredMessageId;
    };

    @action
    setFormValue = <Key extends keyof CreateMessageFormData>(key: Key, value: CreateMessageFormData[Key]): void => {
        this.createMessageForm[key] = value;
    };

    @action
    createMessage = (): void => {
        if (this.selectedChatId) {
            const chatId = this.selectedChatId;
            this.validateForm().then(formValid => {
                if (formValid) {
                    this.pending = true;
                    this.submissionError = undefined;

                    MessageApi.createMessage(chatId, {
                        text: this.createMessageForm.text,
                        referredMessageId: this.shouldSendReferredMessageId ? this.referredMessageId : undefined,
                        uploadAttachments: this.attachmentsIds
                    })
                        .then(({data}) => {
                            this.entitiesStore.insertMessage(data);
                            this.resetForm();
                        })
                        .catch(error => this.submissionError = getInitialApiErrorFromResponse(error))
                        .finally(() => this.pending = false)
                }
            })
        }
    };

    @action
    validateForm = (): Promise<boolean> => {
        return new Promise<boolean>(resolve => {
            this.formErrors.text = validateMessageText(this.createMessageForm.text, {acceptEmpty: this.attachmentsIds.length !== 0});
            resolve(!Boolean(this.formErrors.text));
        });
    };

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
    };
}
