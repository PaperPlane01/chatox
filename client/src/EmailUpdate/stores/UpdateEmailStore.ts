import {action, computed, observable, reaction, runInAction} from "mobx";
import {UpdateEmailDialogStore} from "./UpdateEmailDialogStore";
import {SendEmailChangeConfirmationCodeStore} from "./SendEmailChangeConfirmationCodeStore";
import {SendNewEmailConfirmationCodeStore} from "./SendNewEmailConfirmationCodeStore";
import {UpdateEmailStep} from "../types";
import {ApiError, getInitialApiErrorFromResponse, UserApi} from "../../api";
import {UpdateEmailRequest} from "../../api/types/request";
import {CheckEmailConfirmationCodeStore} from "../../EmailConfirmation";
import {AuthorizationStore} from "../../Authorization";
import {CurrentUser} from "../../api/types/response";
import {SnackbarService} from "../../Snackbar";
import {LocaleStore} from "../../localization";

export class UpdateEmailStore {
    @observable
    pending: boolean = false;

    @observable
    error?: ApiError = undefined;

    @computed
    get currentUser(): CurrentUser | undefined {
        return this.authorizationStore.currentUser;
    }

    constructor(private readonly updateEmailDialogStore: UpdateEmailDialogStore,
                private readonly sendEmailChangeConfirmationCodeStore: SendEmailChangeConfirmationCodeStore,
                private readonly checkEmailChangeConfirmationCodeStore: CheckEmailConfirmationCodeStore,
                private readonly sendNewEmailConfirmationCodeStore: SendNewEmailConfirmationCodeStore,
                private readonly checkNewEmailConfirmationCodeStore: CheckEmailConfirmationCodeStore,
                private readonly authorizationStore: AuthorizationStore,
                private readonly localeStore: LocaleStore,
                private readonly snackbarService: SnackbarService) {
        reaction(
            () => updateEmailDialogStore.currentStep,
            step => {
                if (step === UpdateEmailStep.UPDATE_EMAIL) {
                    this.updateEmail();
                }
            }
        )
    }

    @action
    initialize = (): void => {
        if (!this.currentUser) {
            return;
        }

        if (this.currentUser.email) {
            this.updateEmailDialogStore.setCurrentStep(UpdateEmailStep.CREATE_CHANGE_EMAIL_CONFIRMATION_CODE);
        } else {
            this.updateEmailDialogStore.setCurrentStep(UpdateEmailStep.CREATE_NEW_EMAIL_CONFIRMATION_CODE);
        }

        this.updateEmailDialogStore.setUpdateEmailDialogOpen(true);
    }

    @action
    reset = (): void => {
        this.updateEmailDialogStore.setUpdateEmailDialogOpen(false);
        this.updateEmailDialogStore.setCurrentStep(UpdateEmailStep.NONE);
        this.sendEmailChangeConfirmationCodeStore.reset();
        this.sendNewEmailConfirmationCodeStore.reset();
        this.checkEmailChangeConfirmationCodeStore.reset();
        this.checkNewEmailConfirmationCodeStore.reset();
        this.error = undefined;
        this.pending = false;
    }

    @action
    updateEmail = (): void => {
        this.pending = false;
        this.error = undefined;

        if (!this.sendNewEmailConfirmationCodeStore.emailConfirmationCode) {
            return;
        }

        if (!this.authorizationStore.currentUser) {
            return;
        }

        const currentUserEmail = this.authorizationStore.currentUser.email;

        if (currentUserEmail && !this.sendNewEmailConfirmationCodeStore.emailConfirmationCode) {
            return;
        }

        const updateEmailRequest: UpdateEmailRequest = {
            newEmail: this.sendNewEmailConfirmationCodeStore.formValues.email,
            newEmailConfirmationCodeId: this.sendNewEmailConfirmationCodeStore.emailConfirmationCode.id,
            newEmailConfirmationCode: this.checkNewEmailConfirmationCodeStore.formValues.confirmationCode
        };

        if (currentUserEmail) {
            updateEmailRequest.oldEmail = currentUserEmail;
            updateEmailRequest.changeEmailConfirmationCodeId
                = this.sendEmailChangeConfirmationCodeStore.emailConfirmationCode!.id
            updateEmailRequest.changeEmailConfirmationCode
                = this.checkEmailChangeConfirmationCodeStore.formValues.confirmationCode;
        }

        const currentUserId = this.authorizationStore.currentUser.id;

        UserApi.updateEmail(updateEmailRequest)
            .then(() => {
                if (this.authorizationStore.currentUser && this.authorizationStore.currentUser.id === currentUserId) {
                    this.authorizationStore.setCurrentUser({
                        ...this.authorizationStore.currentUser,
                        email: updateEmailRequest.newEmail
                    });
                }
                this.reset();
                this.snackbarService.enqueueSnackbar(this.localeStore.getCurrentLanguageLabel("email.update.success"));
            })
            .catch(error => runInAction(() => {
                this.error = getInitialApiErrorFromResponse(error);
                this.updateEmailDialogStore.setCurrentStep(UpdateEmailStep.ERROR);
            }))
            .finally(() => runInAction(() => this.pending = false));
    }
}