import {action, computed, makeObservable, observable, reaction} from "mobx";
import {addMinutes} from "date-fns";
import {validateMessageScheduledDate, validateMessageText} from "../validation";
import {UpdateScheduledMessageFormData} from "../types";
import {MessageEntity} from "../../Message";
import {AbstractFormStore} from "../../form-store";
import {getInitialApiErrorFromResponse, MessageApi} from "../../api";
import {EntitiesStore} from "../../entities-store";
import {getDate} from "../../utils/date-utils";

export class UpdateScheduledMessageStore extends AbstractFormStore<UpdateScheduledMessageFormData> {
    messageId?: string;

    updateScheduledMessageDialogOpen: boolean = false;

    showSnackbar: boolean = false;

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

        makeObservable<UpdateScheduledMessageStore, "validateForm">(this, {
            messageId: observable,
            updateScheduledMessageDialogOpen: observable,
            showSnackbar: observable,
            message: computed,
            setMessageId: action,
            setUpdateMessageDialogOpen: action,
            setShowSnackbar: action,
            submitForm: action.bound,
            validateForm: action.bound
        });

        reaction(
            () => this.message,
            message => {
                if (message) {
                    this.setForm({text: message.text, scheduledAt: getDate(message.scheduledAt!)});
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

    setMessageId = (messageId?: string): void => {
        this.messageId = messageId;
    };

    setUpdateMessageDialogOpen = (updateMessageDialogOpen: boolean): void => {
        this.updateScheduledMessageDialogOpen = updateMessageDialogOpen;
    };

    setShowSnackbar = (showSnackbar: boolean): void => {
        this.showSnackbar = showSnackbar;
    };

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
                this.entities.scheduledMessages.insert(data);
            })
            .catch(error => this.setError(getInitialApiErrorFromResponse(error)))
            .finally(() => this.setPending(false));
    }

    protected validateForm(): boolean {
        this.formErrors = {
            text: validateMessageText(this.formValues.text, {acceptEmpty: this.message!.uploads.length !== 0}),
            scheduledAt: validateMessageScheduledDate(this.formValues.scheduledAt)
        };

        return !Boolean(this.formErrors.text || this.formErrors.scheduledAt);
    }
}
