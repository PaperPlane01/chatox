import {makeAutoObservable, reaction, runInAction} from "mobx";
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
    updatedGlobalBanId?: string = undefined;
    
    updateGlobalBanDialogOpen: boolean = false;
    
    updateGlobalBanForm: BanUserFormData = UPDATE_GLOBAL_BAN_FORM_INITIAL_STATE;
    
    formErrors: FormErrors<BanUserFormData> = FORM_ERRORS_INITIAL_STATE;
    
    pending: boolean = false;
    
    error?: ApiError = undefined;

    showSnackbar: boolean = false;
    
    get updatedGlobalBan(): GlobalBanEntity | undefined {
        if (this.updatedGlobalBanId) {
            return this.entities.globalBans.findById(this.updatedGlobalBanId);
        } else {
            return undefined;
        }
    }
    
    constructor(private readonly entities: EntitiesStore) {
        makeAutoObservable(this);

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

    setFormValue = <Key extends keyof BanUserFormData>(key: Key, value: BanUserFormData[Key]): void => {
        this.updateGlobalBanForm[key] = value;
    };

    setUpdatedGlobalBanId = (updatedGlobalBanId?: string): void => {
        this.updatedGlobalBanId = updatedGlobalBanId;
    };

    setUpdateGlobalBanDialogOpen = (updatedGlobalBanDialogOpen: boolean): void => {
        this.updateGlobalBanDialogOpen = updatedGlobalBanDialogOpen;
    };

    setShowSnackbar = (showSnackbar: boolean): void => {
        this.showSnackbar = showSnackbar;
    };

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
                this.entities.globalBans.insert(data);
            })
            .catch(error => runInAction(() => this.error = getInitialApiErrorFromResponse(error)))
            .finally(() => runInAction(() => this.pending = false));
    };
    
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
    };
}
