import {action, computed, observable, reaction} from "mobx";
import {UpdateSelectedReportsStore} from "./UpdateSelectedReportsStore";
import {ReportsListStore} from "./ReportsListStore";
import {AbstractFormStore} from "../../form-store";
import {BanUserFormData} from "../../GlobalBan/types";
import {validateGlobalBanComment, validateGlobalBanExpirationDate} from "../../GlobalBan/validation";
import {EntitiesStore} from "../../entities-store";
import {FormErrors} from "../../utils/types";
import {getInitialApiErrorFromResponse} from "../../api";
import {GlobalBanApi} from "../../api/clients";
import {BanUserRequest} from "../../api/types/request";
import {GlobalBanReason, ReportStatus, ReportTakenAction} from "../../api/types/response";

const INITIAL_FORM_VALUES: BanUserFormData = {
    reason: GlobalBanReason.SPAM,
    permanent: true,
    expiresAt: undefined,
    comment: undefined
};

const INITIAL_FORM_ERRORS: FormErrors<BanUserFormData> = {
    reason: undefined,
    permanent: undefined,
    expiresAt: undefined,
    comment: undefined
};

export class BanSendersOfSelectedMessagesStore extends AbstractFormStore<BanUserFormData> {
    @observable
    banSendersOfSelectedMessagesDialogOpen: boolean = false;

    @observable
    showSnackbar: boolean = false;

    @computed
    get usersIdsToBan(): string[] {
        const messages = this.entities.reportedMessages.findAllById(this.reportsListStore.selectedReportedObjectsIds);
        const users = messages.map(message => this.entities.reportedMessagesSenders.findById(message.sender));

        return users.map(user => user.id);
    }

    constructor(private readonly entities: EntitiesStore,
                private readonly reportsListStore: ReportsListStore,
                private readonly updateSelectedReportsStore: UpdateSelectedReportsStore) {
        super(INITIAL_FORM_VALUES, INITIAL_FORM_ERRORS);

        reaction(
            () => this.formValues.expiresAt,
            expiresAt => this.formErrors.expiresAt = validateGlobalBanExpirationDate(expiresAt, this.formValues.permanent)
        );

        reaction(
            () => this.formValues.comment,
            comment => this.formErrors.comment = validateGlobalBanComment(comment, this.formValues.reason)
        );
    }

    @action
    setBanSendersOfSelectedMessagesDialogOpen = (banSendersOfSelectedMessagesDialogOpen: boolean): void => {
        this.banSendersOfSelectedMessagesDialogOpen = banSendersOfSelectedMessagesDialogOpen;
    }

    @action
    setShowSnackbar = (showSnackbar: boolean): void => {
        this.showSnackbar = showSnackbar;
    }

    @action.bound
    public submitForm(): void {
        if (!this.validateForm()) {
            return;
        }

        this.pending = true;
        this.error = undefined;

        const bans: Array<BanUserRequest & {userId: string}> = this.usersIdsToBan.map(userId => ({
            userId,
            comment: this.formValues.comment,
            expiresAt: this.formValues.expiresAt ? this.formValues.expiresAt.toISOString() : undefined,
            permanent: this.formValues.permanent,
            reason: this.formValues.reason
        }));

        GlobalBanApi.banMultipleUsers({bans})
            .then(() => {
                this.updateSelectedReportsStore.updateSelectedReports(
                    [ReportTakenAction.USER_BANNED],
                    ReportStatus.ACCEPTED
                );
                this.setBanSendersOfSelectedMessagesDialogOpen(false);
                this.setShowSnackbar(true);
            })
            .catch(error => this.error = getInitialApiErrorFromResponse(error))
            .finally(() => this.pending = false);
    }

    @action.bound
    protected validateForm(): boolean {
        this.formErrors = {
            reason: undefined,
            expiresAt: validateGlobalBanExpirationDate(this.formValues.expiresAt, this.formValues.permanent),
            comment: validateGlobalBanComment(this.formValues.comment, this.formValues.reason),
            permanent: undefined
        };

        return !Boolean(this.formErrors.expiresAt || this.formErrors.comment);
    }
}
