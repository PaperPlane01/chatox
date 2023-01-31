import {action, computed, makeObservable, override, reaction} from "mobx";
import {UpdateEmailDialogStore} from "./UpdateEmailDialogStore";
import {UpdateEmailStep} from "../types";
import {EmailConfirmationCodeType} from "../../api/types/request";
import {AbstractCreateEmailConfirmationCodeStore} from "../../EmailConfirmation";
import {AuthorizationStore} from "../../Authorization";
import {LocaleStore} from "../../localization";

export class SendEmailChangeConfirmationCodeStore extends AbstractCreateEmailConfirmationCodeStore {
    get currentUserEmail(): string {
        return this.authorizationStore.currentUser
            ? this.authorizationStore.currentUser.email || ""
            : "";
    }

    constructor(private readonly updateEmailDialogStore: UpdateEmailDialogStore,
                private readonly authorizationStore: AuthorizationStore,
                localeStore: LocaleStore) {
        super(localeStore);

        makeObservable<SendEmailChangeConfirmationCodeStore, "currentUserEmail">(this, {
            submitForm: action,
            currentUserEmail: computed
        });

        reaction(
            () => this.emailConfirmationCode,
            emailConfirmationCode => {
                if (emailConfirmationCode) {
                    this.updateEmailDialogStore.setCurrentStep(UpdateEmailStep.CHECK_CHANGE_EMAIL_CONFIRMATION_CODE);
                }
            }
        )
    }

    submitForm(): void {
        this.setForm({
            email: this.currentUserEmail
        });
        super.submitForm();
    }

    protected getType(): EmailConfirmationCodeType {
        return EmailConfirmationCodeType.CONFIRM_EMAIL_CHANGE;
    }

}