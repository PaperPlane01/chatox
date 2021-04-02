import {action, computed, observable, reaction} from "mobx";
import {MessageEntity, UpdateScheduledMessageFormData} from "../types";
import {validateMessageScheduledDate, validateMessageText} from "../validation";
import {AbstractFormStore} from "../../form-store";
import {getInitialApiErrorFromResponse, MessageApi} from "../../api";
import {EntitiesStore} from "../../entities-store";
import {addMinutes} from "date-fns";

export class UpdateScheduledMessageStore extends AbstractFormStore<UpdateScheduledMessageFormData> {
    @observable
    messageId?: string;

    @observable
    updateScheduledMessageDialogOpen: boolean = false;

    @observable
    showSnackbar: boolean = false;

    @computed
    get message(): MessageEntity | undefined {
        if (this.messageId) {
            return this.entities.scheduledMessages.findByIdOptional(this.messageId);
        } else {
            return undefined;
        }
    }

    constructor(private readonly entities: EntitiesStore) {
        super(
            {text: "", scheduledAt: addMinutes(new Date(), 10)},
            {text: undefined, scheduledAt: undefined}
        );

        reaction(
            () => this.message,
            message => {
                if (message) {
                    this.setForm({text: message.text, scheduledAt: message.scheduledAt!});
                } else {
                    this.resetForm();
                }
            }
        );

        reaction(
            () => this.formValues.text,
            text => this.setFormError(
                "text",
                validateMessageText(text, {acceptEmpty: Boolean(this.message && this.message.uploads.length !== 0)})
            )
        );

        reaction(
            () => this.formValues.scheduledAt,
            scheduledAt => this.setFormError("scheduledAt", validateMessageScheduledDate(scheduledAt))
        );
    }

    @action
    setMessageId = (messageId?: string): void => {
        this.messageId = messageId;
    }

    @action
    setUpdateMessageDialogOpen = (updateMessageDialogOpen: boolean): void => {
        this.updateScheduledMessageDialogOpen = updateMessageDialogOpen;
    }

    @action
    setShowSnackbar = (showSnackbar: boolean): void => {
        this.showSnackbar = showSnackbar;
    }

    @action.bound
    public submitForm(): void {
        if (!this.message) {
            this.error = {
                status: 404,
                message: "message.delayed-message.update.error.deleted-or-published"
            };
            return;
        }

        if (!this.validateForm()) {
            return;
        }

        this.pending = true;

        MessageApi.updateScheduledMessage(this.message.chatId, this.message.id, {
            text: this.formValues.text,
            scheduledAt: this.formValues.scheduledAt.toISOString()
        })
            .then(({data}) => {
                this.setShowSnackbar(true);
                this.resetForm();
                this.entities.insertMessage(data);
            })
            .catch(error => this.error = getInitialApiErrorFromResponse(error))
            .finally(() => this.pending = false);
    }

    @action.bound
    protected validateForm(): boolean {
        this.formErrors = {
            text: validateMessageText(this.formValues.text, {acceptEmpty: this.message!.uploads.length !== 0}),
            scheduledAt: validateMessageScheduledDate(this.formValues.scheduledAt)
        };

        return !Boolean(this.formErrors.text || this.formErrors.scheduledAt);
    }
}
