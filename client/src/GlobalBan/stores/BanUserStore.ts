import {action, observable, reaction} from "mobx";
import {addMonths} from "date-fns";
import {BanUserFormData} from "../types";
import {validateGlobalBanComment, validateGlobalBanExpirationDate} from "../validation";
import {ApiError, getInitialApiErrorFromResponse} from "../../api";
import {GlobalBanApi} from "../../api/clients";
import {BanUserRequest} from "../../api/types/request";
import {GlobalBanReason} from "../../api/types/response";
import {FormErrors} from "../../utils/types";
import {EntitiesStore} from "../../entities-store";

const BAN_USER_FORM_INITIAL_STATE: BanUserFormData = {
    comment: "",
    expiresAt: undefined,
    permanent: false,
    reason: GlobalBanReason.SPAM
};

const FORM_ERRORS_INITIAL_STATE: FormErrors<BanUserFormData> = {
    comment: undefined,
    expiresAt: undefined,
    permanent: undefined,
    reason: undefined
};

export class BanUserStore {
    @observable
    banUserForm: BanUserFormData = BAN_USER_FORM_INITIAL_STATE;

    @observable
    formErrors: FormErrors<BanUserFormData> = FORM_ERRORS_INITIAL_STATE;

    @observable
    banUserDialogOpen: boolean = false;

    @observable
    bannedUserId: string | undefined = undefined;

    @observable
    pending: boolean = false;

    @observable
    error: ApiError | undefined = undefined;

    @observable
    showSnackbar: boolean = false;

    constructor(private readonly entities: EntitiesStore) {
        reaction(
            () => this.banUserDialogOpen,
            dialogOpen => {
                if (dialogOpen) {
                    this.setFormValue("expiresAt", addMonths(new Date(), 1));
                }
            }
        );

        reaction(
            () => this.banUserForm.permanent,
            permanent => {
                if (permanent) {
                    this.setFormValue("expiresAt", undefined);
                } else {
                    this.setFormValue("expiresAt", addMonths(new Date(), 1));
                }
            }
        );

        reaction(
            () => this.banUserForm.reason,
                reason => this.formErrors.comment = validateGlobalBanComment(this.banUserForm.comment, reason)
        );

        reaction(
            () => this.banUserForm.expiresAt,
            expiresAt => this.formErrors.expiresAt = validateGlobalBanExpirationDate(expiresAt, this.banUserForm.permanent)
        );

        reaction(
            () => this.banUserForm.comment,
            comment => this.formErrors.comment = validateGlobalBanComment(comment, this.banUserForm.reason)
        );
    }

    @action
    setBannedUserId = (bannedUserId: string | undefined): void => {
        this.bannedUserId = bannedUserId;
    }

    @action
    setBanUserDialogOpen = (banUserDialogOpen: boolean): void => {
        this.banUserDialogOpen = banUserDialogOpen;
    }

    @action
    setShowSnackbar = (showSnackbar: boolean): void => {
        this.showSnackbar = showSnackbar;
    }

    @action
    setFormValue = <Key extends keyof BanUserFormData>(key: Key, value: BanUserFormData[Key]): void => {
        this.banUserForm[key] = value;
    }

    @action
    banUser = (): void => {
        if (!this.bannedUserId) {
            return;
        }

        if (!this.validateForm()) {
            return;
        }

        const banUserRequest: BanUserRequest = {
            ...this.banUserForm,
            expiresAt: (!this.banUserForm.permanent && this.banUserForm.expiresAt)
                ? this.banUserForm.expiresAt.toISOString()
                : undefined
        };

        this.pending = true;
        this.error = undefined;

        GlobalBanApi.banUser(this.bannedUserId, banUserRequest)
            .then(({data}) => {
                this.entities.globalBans.insert(data);
                this.setBanUserDialogOpen(false);
                this.setShowSnackbar(true);
                this.resetForm();
            })
            .catch(error => this.error = getInitialApiErrorFromResponse(error))
            .finally(() => this.pending = false);
    }

    @action
    validateForm = (): boolean => {
        this.formErrors = {
            ...this.formErrors,
            permanent: undefined,
            expiresAt: validateGlobalBanExpirationDate(this.banUserForm.expiresAt, this.banUserForm.permanent),
            comment: validateGlobalBanComment(this.banUserForm.comment, this.banUserForm.reason),
            reason: undefined
        };

        const {comment, reason} = this.formErrors;

        return !Boolean(comment || reason);
    }

    @action
    resetForm = (): void => {
        this.banUserForm = BAN_USER_FORM_INITIAL_STATE;
        setTimeout(() => this.formErrors = FORM_ERRORS_INITIAL_STATE);
    }
}