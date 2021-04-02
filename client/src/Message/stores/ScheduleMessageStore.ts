import {action, computed, observable, reaction} from "mobx";
import {addMinutes} from "date-fns";
import {CreateMessageStore} from "./CreateMessageStore";
import {Labels} from "../../localization/types";
import {ApiError} from "../../api";

export class ScheduleMessageStore {
    @observable
    scheduleMessageDialogOpen: boolean = false;

    @computed
    get scheduledAt(): Date | undefined {
        return this.createMessageStore.createMessageForm.scheduledAt;
    }

    @computed
    get scheduledAtValidationError(): keyof Labels | undefined {
        return this.createMessageStore.formErrors.scheduledAt;
    }

    @computed
    get submissionError(): ApiError | undefined {
        return this.createMessageStore.submissionError;
    }

    constructor(private readonly createMessageStore: CreateMessageStore) {
        reaction(
            () => this.scheduledAtValidationError,
            scheduledAtError => {
                if (scheduledAtError) {
                    this.setScheduleMessageDialogOpen(true);
                }
            }
        );

        reaction(
            () => this.submissionError,
            submissionError => {
                if (submissionError && submissionError.metadata && submissionError.metadata.errorCode) {
                    if (submissionError.metadata.errorCode === "LIMIT_OF_SCHEDULED_MESSAGES_REACHED"
                        || submissionError.metadata.errorCode === "SCHEDULED_MESSAGE_IS_TOO_CLOSE_TO_ANOTHER_SCHEDULED_MESSAGE") {
                        this.setScheduleMessageDialogOpen(true);
                    }
                }
            }
        );

        reaction(
            () => this.scheduleMessageDialogOpen,
            dialogOpen => {
                if (dialogOpen && !this.scheduledAt) {
                    this.setScheduledAt(addMinutes(new Date(), 10))
                }
            }
        );
    }

    @action
    setScheduleMessageDialogOpen = (scheduleMessageDialogOpen: boolean): void => {
        this.scheduleMessageDialogOpen = scheduleMessageDialogOpen;
    }

    @action
    setScheduledAt = (scheduledAt?: Date): void => {
        this.createMessageStore.setFormValue("scheduledAt", scheduledAt);
    }

    @action
    cancelMessageScheduling = (): void => {
        this.setScheduleMessageDialogOpen(false);
        this.setScheduledAt(undefined);
    }
}
