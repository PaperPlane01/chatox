import {makeAutoObservable, reaction} from "mobx";
import {UpdateMessageFormData} from "../types";
import {FormErrors} from "../../utils/types";
import {EntitiesStore} from "../../entities-store";
import {validateMessageText} from "../validation";
import {ApiError, getInitialApiErrorFromResponse, MessageApi} from "../../api";
import {ChatStore} from "../../Chat/stores";

export class UpdateMessageStore {
    updateMessageForm: UpdateMessageFormData = {
        text: ""
    };

    formErrors: FormErrors<UpdateMessageFormData> = {
        text: undefined
    };

    updatedMessageId?: string = undefined;

    pending: boolean = false;

    error?: ApiError = undefined;

    get selectedChatId(): string | undefined {
        return this.chatStore.selectedChatId;
    }

    constructor(private readonly chatStore: ChatStore,
                private readonly entities: EntitiesStore) {
        makeAutoObservable(this);

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

    setUpdatedMessageId = (messageId?: string): void => {
        this.updatedMessageId = messageId;
    };

    setFormValue = <Key extends keyof UpdateMessageFormData>(key: Key, value: UpdateMessageFormData[Key]): void => {
        this.updateMessageForm[key] = value;
    };

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
                this.entities.messages.insert(data);
                this.updatedMessageId = undefined;
                this.reset();
            })
            .catch(error => this.error = getInitialApiErrorFromResponse(error))
            .finally(() => this.pending = false);
    };

    validateForm = (): boolean => {
        this.formErrors.text = validateMessageText(this.updateMessageForm.text);

        return !Boolean(this.formErrors.text);
    };

    reset = () => {
        this.updatedMessageId = undefined;
        this.setFormValue("text", "");
        setTimeout(() => this.formErrors = {text: undefined});
    };
}
