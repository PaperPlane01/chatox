import {action, computed, makeObservable, observable, reaction} from "mobx";
import {UploadMessageAttachmentsStore} from "./UploadMessageAttachmentsStore";
import {MessageFormData} from "../types";
import {validateMessageText} from "../validation";
import {AbstractFormStore} from "../../form-store";
import {FormErrors} from "../../utils/types";
import {ChatStore} from "../../Chat";
import {EntitiesStore} from "../../entities-store";
import {MessageEntity} from "../../Message/types";

export abstract class AbstractMessageFormStore<T extends MessageFormData> extends AbstractFormStore<T> {
    emojiPickerExpanded: boolean = false;

    get selectedChatId(): string | undefined {
        return this.chatStore.selectedChatId;
    }

    get attachmentsIds(): string[] {
        return this.messageUploads.messageAttachmentsFiles
            .filter(fileContainer => fileContainer.uploadedFile !== undefined && fileContainer.uploadedFile !== null)
            .map(fileContainer => fileContainer.uploadedFile!.id!)
    };

    resultMessage?: MessageEntity = undefined;

    protected constructor(
        initialFormValues: T,
        initialFormErrors: FormErrors<T>,
        protected readonly chatStore: ChatStore,
        protected readonly messageUploads: UploadMessageAttachmentsStore,
        protected readonly entities: EntitiesStore) {
        super(initialFormValues, initialFormErrors);

        makeObservable<AbstractMessageFormStore<any>>(this, {
            emojiPickerExpanded: observable,
            selectedChatId: computed,
            attachmentsIds: computed,
            setEmojiPickerExpanded: action,
            setResultMessage: action,
            clearResultMessage: action
        });

        reaction(
            () => this.formValues.text,
            text => this.setFormError("text", validateMessageText(text, {
                acceptEmpty: this.attachmentsIds.length !== 0
            }))
        );
    }

    protected reset(): void {
        this.resetForm();
        this.setEmojiPickerExpanded(false);
        this.messageUploads.reset();
    }

    protected validateForm (): boolean {
        this.formErrors = {
            ...this.formErrors,
            text: validateMessageText(this.formValues.text, {
                acceptEmpty: this.attachmentsIds.length !== 0
            })
        };

        return !this.formErrors.text;
    }

    setEmojiPickerExpanded = (emojiPickerExpanded: boolean): void => {
        this.emojiPickerExpanded = emojiPickerExpanded;
    }

    setResultMessage = (resultMessage: MessageEntity): void => {
        this.resultMessage = resultMessage;
    }

    clearResultMessage = (): void => {
        this.resultMessage = undefined;
    }
}

