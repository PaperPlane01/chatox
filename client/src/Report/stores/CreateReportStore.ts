import {action, observable, reaction, runInAction} from "mobx";
import {validateReportDescription} from "../validation";
import {CreateReportFormData} from "../types";
import {AbstractFormStore} from "../../form-store";
import {ReportReason, ReportType} from "../../api/types/response";
import {ReportsApi} from "../../api/clients";
import {getInitialApiErrorFromResponse} from "../../api";

export class CreateReportStore extends AbstractFormStore<CreateReportFormData>{
    @observable
    reportedObjectId?: string = undefined;

    @observable
    showSuccessMessage: boolean = false;

    constructor(private readonly reportType: ReportType) {
        super(
            {description: "", reason: ReportReason.SPAM},
            {description: undefined, reason: undefined}
        );

        reaction(
            () => this.formValues.description,
            description => this.formErrors.description = validateReportDescription(description)
        );

        reaction(
            () => this.reportedObjectId,
            () => this.resetForm()
        );
    }

    @action
    setReportedObjectId = (reportedObjectId?: string): void => {
        this.reportedObjectId = reportedObjectId;
    }

    @action
    setShowSuccessMessage = (showSuccessMessage: boolean): void => {
        this.showSuccessMessage = showSuccessMessage;
    }

    @action.bound
    public submitForm(): void {
        if (!this.reportedObjectId) {
            return;
        }

        if (!this.validateForm()) {
            return;
        }

        this.pending = true;
        this.error = undefined;

        ReportsApi.createReport({
            ...this.formValues,
            reportedObjectId: this.reportedObjectId,
            type: this.reportType
        })
            .then(() => runInAction(() => this.showSuccessMessage = true))
            .catch(error => runInAction(() => this.error = getInitialApiErrorFromResponse(error)))
            .finally(() => runInAction(() => this.pending = false));
    }

    @action.bound
    protected validateForm(): boolean {
        this.formErrors = {
            ...this.formErrors,
            description: validateReportDescription(this.formValues.description)
        };

        return !Boolean(this.formErrors.description);
    }

}
