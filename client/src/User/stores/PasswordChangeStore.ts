import {makeAutoObservable, reaction} from "mobx";
import {EmailConfirmationArguments, PasswordChangeFormSubmissionStore} from "./PasswordChangeFormSubmissionStore";
import {SendPasswordChangeEmailConfirmationCodeStore} from "./SendPasswordChangeEmailConfirmationCodeStore";
import {ChangePasswordStep} from "../types";
import {AuthorizationStore} from "../../Authorization/stores";
import {CurrentUser} from "../../api/types/response";
import {PasswordChangeStepStore} from "./PasswordChangeStepStore";
import {CheckEmailConfirmationCodeStore} from "../../EmailConfirmation";

export class PasswordChangeStore {
    showSuccessSnackbar: boolean = false;

    get currentStep(): ChangePasswordStep {
        return this.passwordChangeStepStore.currentStep;
    }

    get currentUser(): CurrentUser | undefined {
        return this.authorizationStore.currentUser;
    }

    get currentUserId(): string | undefined {
        if (this.currentUser) {
            return this.currentUser.id;
        }

        return undefined;
    }

    get currentUserHasEmail(): boolean {
        return Boolean(this.currentUser && this.currentUser.email);
    }

    constructor(private readonly passwordChangeFormSubmissionStore: PasswordChangeFormSubmissionStore,
                private readonly sendPasswordChangeEmailConfirmationCodeStore: SendPasswordChangeEmailConfirmationCodeStore,
                private readonly checkEmailConfirmationCodeStore: CheckEmailConfirmationCodeStore,
                private readonly passwordChangeStepStore: PasswordChangeStepStore,
                private readonly authorizationStore: AuthorizationStore) {
        makeAutoObservable(this);

        reaction(
            () => this.currentStep,
            currentStep => this.processPasswordChangeStep(currentStep)
        );

        reaction(
            () => this.currentUserId,
            () => this.reset()
        );
    };

    processPasswordChangeStep = (changePasswordStep: ChangePasswordStep): void => {
        switch (changePasswordStep) {
            case ChangePasswordStep.VALIDATE_FORM_AND_CHECK_IF_CONFIRMATION_CODE_SHOULD_BE_SENT:
               this.validateFormAndCheckIfEmailConfirmationCodeShouldBeSent();
               break;
            case ChangePasswordStep.CREATE_EMAIL_CONFIRMATION_CODE:
                this.sendPasswordChangeEmailConfirmationCodeStore.sendEmailConfirmationCode();
                break;
            case ChangePasswordStep.CHANGE_PASSWORD:
                this.changePassword();
                break;
            case ChangePasswordStep.CHANGE_PASSWORD_SUCCESS:
                this.showSuccessSnackbarAndResetEverything();
                break;
            case ChangePasswordStep.CHANGE_PASSWORD_ERROR:
                this.checkEmailConfirmationCodeStore.reset();
                break;
        }
    };

    validateFormAndCheckIfEmailConfirmationCodeShouldBeSent = (): void => {
        if (this.passwordChangeFormSubmissionStore.validateForm()) {
            if (this.currentUserHasEmail) {
                this.passwordChangeStepStore.setCurrentStep(ChangePasswordStep.CREATE_EMAIL_CONFIRMATION_CODE);
            } else {
                this.passwordChangeStepStore.setCurrentStep(ChangePasswordStep.CHANGE_PASSWORD);
            }
        }
    };

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

    showSuccessSnackbarAndResetEverything = (): void => {
        this.setShowSuccessSnackbar(true);
        this.reset();
    };

    reset = (): void => {
        this.passwordChangeFormSubmissionStore.reset();
        this.sendPasswordChangeEmailConfirmationCodeStore.reset();
        this.checkEmailConfirmationCodeStore.reset();
        this.passwordChangeStepStore.setCurrentStep(ChangePasswordStep.NONE);
    };

    setShowSuccessSnackbar = (showSuccessSnackbar: boolean): void => {
        this.showSuccessSnackbar = showSuccessSnackbar;
    };
}
