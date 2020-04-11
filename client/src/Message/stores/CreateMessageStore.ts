import {action, reaction, observable, computed} from "mobx";
import {CreateMessageFormData} from "../types";
import {validateMessageText} from "../validation";
import {ChatStore} from "../../Chat";
import {FormErrors} from "../../utils/types";
import {MessageApi, ApiError, getInitialApiErrorFromResponse} from "../../api";
import {EntitiesStore} from "../../entities-store";

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

    @computed
    get selectedChatId(): string | undefined {
        return this.chatStore.selectedChatId;
    }

    constructor(
        private readonly chatStore: ChatStore,
        private readonly entitiesStore: EntitiesStore
    ) {
        reaction(
            () => this.createMessageForm.text,
            text => this.formErrors.text = validateMessageText(text)
        )
    }

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
                        text: this.createMessageForm.text
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
            this.formErrors.text = validateMessageText(this.createMessageForm.text);
            resolve(!Boolean(this.formErrors.text));
        });
    };

    @action
    resetForm = (): void => {
        this.createMessageForm = {
            text: ""
        };
        setTimeout(() => {
            this.formErrors = {
                text: undefined
            }
        })
    }
}
