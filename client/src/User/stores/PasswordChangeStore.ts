import {action, computed, observable, reaction} from "mobx";
import {EmailConfirmationArguments, PasswordChangeFormSubmissionStore} from "./PasswordChangeFormSubmissionStore";
import {SendPasswordChangeEmailConfirmationCodeStore} from "./SendPasswordChangeEmailConfirmationCodeStore";
import {ChangePasswordStep} from "../types";
import {AuthorizationStore} from "../../Authorization/stores";
import {CurrentUser} from "../../api/types/response";
import {PasswordChangeStepStore} from "./PasswordChangeStepStore";
import {CheckEmailConfirmationCodeStore} from "../../EmailConfirmation";

export class PasswordChangeStore {
    @observable
    showSuccessSnackbar: boolean = false;

    @computed
    get currentStep(): ChangePasswordStep {
        return this.passwordChangeStepStore.currentStep;
    }

    @computed
    get currentUser(): CurrentUser | undefined {
        return this.authorizationStore.currentUser;
    }

    @computed
    get currentUserHasEmail(): boolean {
        return Boolean(this.currentUser && this.currentUser.email);
    }

    constructor(private readonly passwordChangeFormSubmissionStore: PasswordChangeFormSubmissionStore,
                private readonly sendPasswordChangeEmailConfirmationCodeStore: SendPasswordChangeEmailConfirmationCodeStore,
                private readonly checkEmailConfirmationCodeStore: CheckEmailConfirmationCodeStore,
                private readonly passwordChangeStepStore: PasswordChangeStepStore,
                private readonly authorizationStore: AuthorizationStore) {
        reaction(
            () => this.currentStep,
            currentStep => this.processPasswordChangeStep(currentStep)
        )
    };

    @action
    processPasswordChangeStep = (changePasswordStep: ChangePasswordStep): void => {
        switch (changePasswordStep) {
            case ChangePasswordStep.VALIDATE_FORM_AND_CHECK_IF_CONFIRMATION_CODE_SHOULD_BE_SENT:
               this.validateFormAndCheckIfEmailConfirmationCodeShouldBeSent();
               break;
            case ChangePasswordStep.CHANGE_PASSWORD:
                this.changePassword();
                break;
            case ChangePasswordStep.CHANGE_PASSWORD_SUCCESS:
                this.showSuccessSnackbarAndResetEverything();
                break;
        }
    };

    @action
    validateFormAndCheckIfEmailConfirmationCodeShouldBeSent = (): void => {
        if (this.passwordChangeFormSubmissionStore.validateForm()) {
            if (this.currentUserHasEmail) {
                this.passwordChangeStepStore.setCurrentStep(ChangePasswordStep.CREATE_EMAIL_CONFIRMATION_CODE);
            } else {
                this.passwordChangeStepStore.setCurrentStep(ChangePasswordStep.CHANGE_PASSWORD);
            }
        }
    };

    @action
    changePassword = (): void => {
        const emailConfirmationId = this.sendPasswordChangeEmailConfirmationCodeStore.emailConfirmationCodeResponse
            && this.sendPasswordChangeEmailConfirmationCodeStore.emailConfirmationCodeResponse.id;

        const emailConfirmationArguments: EmailConfirmationArguments | undefined = emailConfirmationId
            ? {
                emailConfirmationId,
                emailConfirmationCode: this.checkEmailConfirmationCodeStore.checkEmailConfirmationCodeForm.confirmationCode
            }
            : undefined;

        this.passwordChangeFormSubmissionStore.submitForm(emailConfirmationArguments);
    };

    @action
    showSuccessSnackbarAndResetEverything = (): void => {
        this.setShowSuccessSnackbar(true);
        this.passwordChangeFormSubmissionStore.reset();
        this.sendPasswordChangeEmailConfirmationCodeStore.reset();
        this.checkEmailConfirmationCodeStore.reset();
        this.passwordChangeStepStore.setCurrentStep(ChangePasswordStep.NONE);
    };

    @action
    setShowSuccessSnackbar = (showSuccessSnackbar: boolean): void => {
        this.showSuccessSnackbar = showSuccessSnackbar;
    };
}
