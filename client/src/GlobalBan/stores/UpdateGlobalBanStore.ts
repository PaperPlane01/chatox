import {action, computed, observable, reaction} from "mobx";
import {addMonths} from "date-fns";
import {BanUserFormData, GlobalBanEntity} from "../types";
import {validateGlobalBanComment, validateGlobalBanExpirationDate} from "../validation";
import {GlobalBanReason} from "../../api/types/response";
import {FormErrors} from "../../utils/types";
import {ApiError, getInitialApiErrorFromResponse, GlobalBanApi} from "../../api";
import {EntitiesStore} from "../../entities-store";

const UPDATE_GLOBAL_BAN_FORM_INITIAL_STATE: BanUserFormData = {
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

export class UpdateGlobalBanStore {
    @observable
    updatedGlobalBanId?: string = undefined;
    
    @observable
    updateGlobalBanDialogOpen: boolean = false;
    
    @observable
    updateGlobalBanForm: BanUserFormData = UPDATE_GLOBAL_BAN_FORM_INITIAL_STATE;
    
    @observable
    formErrors: FormErrors<BanUserFormData> = FORM_ERRORS_INITIAL_STATE;
    
    @observable
    pending: boolean = false;
    
    @observable
    error?: ApiError = undefined;

    @observable
    showSnackbar: boolean = false;
    
    @computed
    get updatedGlobalBan(): GlobalBanEntity | undefined {
        if (this.updatedGlobalBanId) {
            return this.entities.globalBans.findById(this.updatedGlobalBanId);
        } else {
            return undefined;
        }
    }
    
    constructor(private readonly entities: EntitiesStore) {
        reaction(
            () => this.updatedGlobalBan,
            () => {
                if (this.updatedGlobalBan) {
                    this.updateGlobalBanForm = {
                        comment: this.updatedGlobalBan.comment,
                        expiresAt: this.updatedGlobalBan.expiresAt,
                        permanent: this.updatedGlobalBan.permanent,
                        reason: this.updatedGlobalBan.reason
                    }
                } else {
                    this.updateGlobalBanForm = UPDATE_GLOBAL_BAN_FORM_INITIAL_STATE;
                }
            }
        );

        reaction(
            () => this.updateGlobalBanForm.permanent,
            permanent => {
                if (permanent) {
                    this.setFormValue("expiresAt", undefined);
                } else {
                    this.setFormValue("expiresAt", addMonths(new Date(), 1));
                }
            }
        );

        reaction(
            () => this.updateGlobalBanForm.reason,
            reason => this.formErrors.comment = validateGlobalBanComment(this.updateGlobalBanForm.comment, reason)
        );

        reaction(
            () => this.updateGlobalBanForm.expiresAt,
            expiresAt => this.formErrors.expiresAt = validateGlobalBanExpirationDate(expiresAt, this.updateGlobalBanForm.permanent)
        );

        reaction(
            () => this.updateGlobalBanForm.comment,
            comment => this.formErrors.comment = validateGlobalBanComment(comment, this.updateGlobalBanForm.reason)
        );
    }

    @action
    setFormValue = <Key extends keyof BanUserFormData>(key: Key, value: BanUserFormData[Key]): void => {
        this.updateGlobalBanForm[key] = value;
    }

    @action
    setUpdatedGlobalBanId = (updatedGlobalBanId?: string): void => {
        this.updatedGlobalBanId = updatedGlobalBanId;
    }

    @action
    setUpdateGlobalBanDialogOpen = (updatedGlobalBanDialogOpen: boolean): void => {
        this.updateGlobalBanDialogOpen = updatedGlobalBanDialogOpen;
    }

    @action
    setShowSnackbar = (showSnackbar: boolean): void => {
        this.showSnackbar = showSnackbar;
    }

    @action
    updateGlobalBan = (): void => {
        if (!this.updatedGlobalBan) {
            return;
        }

        this.pending = true;
        this.error = undefined;

        GlobalBanApi.updateBan(this.updatedGlobalBan.bannedUserId, this.updatedGlobalBan.id, {
            comment: this.updateGlobalBanForm.comment,
            expiresAt: this.updateGlobalBanForm.expiresAt ? this.updateGlobalBanForm.expiresAt.toISOString() : undefined,
            permanent: this.updateGlobalBanForm.permanent,
            reason: this.updateGlobalBanForm.reason
        })
            .then(({data}) => {
                this.setUpdateGlobalBanDialogOpen(false);
                this.setUpdatedGlobalBanId(undefined);
                this.setShowSnackbar(true);
                this.entities.insertGlobalBan(data);
            })
            .catch(error => this.error = getInitialApiErrorFromResponse(error))
            .finally(() => this.pending = false);
    }
    
    @action
    validateForm = (): boolean => {
        this.formErrors = {
            ...this.formErrors,
            permanent: undefined,
            expiresAt: validateGlobalBanExpirationDate(this.updateGlobalBanForm.expiresAt, this.updateGlobalBanForm.permanent),
            comment: validateGlobalBanComment(this.updateGlobalBanForm.comment, this.updateGlobalBanForm.reason),
            reason: undefined
        };

        const {comment, reason} = this.formErrors;

        return !Boolean(comment || reason);
    }
}
