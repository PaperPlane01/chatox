import {action, computed, observable, reaction} from "mobx";
import {UpdateMessageFormData} from "../types";
import {FormErrors} from "../../utils/types";
import {EntitiesStore} from "../../entities-store";
import {validateMessageText} from "../validation";
import {ApiError, getInitialApiErrorFromResponse, MessageApi} from "../../api";
import {ChatStore} from "../../Chat/stores";

export class UpdateMessageStore {
    @observable
    updateMessageForm: UpdateMessageFormData = {
        text: ""
    };

    @observable
    formErrors: FormErrors<UpdateMessageFormData> = {
        text: undefined
    };

    @observable
    updatedMessageId?: string = undefined;

    @observable
    pending: boolean = false;

    @observable
    error?: ApiError = undefined;

    @computed
    get selectedChatId(): string | undefined {
        return this.chatStore.selectedChatId;
    }

    constructor(private readonly chatStore: ChatStore,
                private readonly entities: EntitiesStore) {
        reaction(
            () => this.updatedMessageId,
            messageId => {
                if (messageId) {
                    const message = this.entities.messages.findById(messageId);
                    this.setFormValue("text", message.text);
                }
            }
        );

        reaction(
            () => this.updateMessageForm.text,
            text => {
                this.formErrors.text = validateMessageText(text);
            }
        );
    }

    @action
    setUpdatedMessageId = (messageId?: string): void => {
        this.updatedMessageId = messageId;
    };

    @action
    setFormValue = <Key extends keyof UpdateMessageFormData>(key: Key, value: UpdateMessageFormData[Key]): void => {
        this.updateMessageForm[key] = value;
    };

    @action
    updateMessage = (): void => {
        if (!this.selectedChatId || !this.updatedMessageId || !this.validateForm()) {
            return;
        }

        this.pending = true;
        this.error = undefined;

        MessageApi.updateMessage(
            this.selectedChatId,
            this.updatedMessageId,
            {text: this.updateMessageForm.text}
        )
            .then(({data}) => {
                this.entities.insertMessage(data);
                this.updatedMessageId = undefined;
                this.reset();
            })
            .catch(error => this.error = getInitialApiErrorFromResponse(error))
            .finally(() => this.pending = false);
    };

    @action
    validateForm = (): boolean => {
        this.formErrors.text = validateMessageText(this.updateMessageForm.text);

        return !Boolean(this.formErrors.text);
    };

    @action
    reset = () => {
        this.updatedMessageId = undefined;
        this.setFormValue("text", "");
        setTimeout(() => this.formErrors = {text: undefined});
    }
}
