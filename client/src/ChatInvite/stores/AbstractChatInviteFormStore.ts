import {action, computed, makeObservable, reaction} from "mobx";
import {AxiosPromise} from "axios";
import {validateInviteName, validateMaxUseTimes} from "../validation";
import {ChatInviteFormData} from "../types";
import {AbstractFormStore} from "../../form-store";
import {getInitialApiErrorFromResponse} from "../../api";
import {ChatInviteRequest} from "../../api/types/request";
import {ChatInvite, JoinChatAllowance, UserVerificationLevel} from "../../api/types/response";
import {containsNotUndefinedValues, createWithUndefinedValues} from "../../utils/object-utils";
import {FormErrors} from "../../utils/types";
import {EntitiesStore} from "../../entities-store";
import {SelectUserStore} from "../../UserSelect";
import {Labels, LocaleStore} from "../../localization";
import {SnackbarService} from "../../Snackbar";
import {isStringEmpty} from "../../utils/string-utils";
import {ChatStore} from "../../Chat";

const INITIAL_FORM_VALUES: ChatInviteFormData = {
    active: true,
    expiresAt: undefined,
    joinAllowanceSettings: {
        [UserVerificationLevel.ANONYMOUS]: JoinChatAllowance.ALLOWED,
        [UserVerificationLevel.REGISTERED]: JoinChatAllowance.ALLOWED,
        [UserVerificationLevel.EMAIL_VERIFIED]: JoinChatAllowance.ALLOWED
    },
    maxUseTimes: undefined,
    name: undefined,
    userId: undefined
};
const INITIAL_FORM_ERRORS: FormErrors<ChatInviteFormData> = createWithUndefinedValues(INITIAL_FORM_VALUES);

export abstract class AbstractChatInviteFormStore extends AbstractFormStore<ChatInviteFormData> {
    get selectedChatId(): string | undefined {
        return this.chatStore.selectedChat?.id;
    }

    protected constructor(protected readonly chatStore: ChatStore,
                          protected readonly entities: EntitiesStore,
                          protected readonly selectedUser: SelectUserStore,
                          protected readonly localeStore: LocaleStore,
                          protected readonly snackbarService: SnackbarService) {
        super(INITIAL_FORM_VALUES, INITIAL_FORM_ERRORS);

        makeObservable<AbstractChatInviteFormStore, "validateForm">(this,{
            selectedChatId: computed,
            setAllowance: action,
            submitForm: action,
            validateForm: action
        });

        reaction(
            () => this.formValues.name,
            name => this.setFormError("name", validateInviteName(name))
        );

        reaction(
            () => this.formValues.maxUseTimes,
            maxUseTimes => this.setFormError("maxUseTimes", validateMaxUseTimes(maxUseTimes))
        );
    }

    setAllowance = (verificationLevel: UserVerificationLevel, allowance: JoinChatAllowance): void => {
        this.formValues.joinAllowanceSettings[verificationLevel] = allowance;
    }

    submitForm = (): void => {
        if (!this.selectedChatId) {
            return;
        }

        if (!this.validateForm()) {
            return;
        }

        this.setPending(true);
        this.setError(undefined);

        const request = this.convertToApiRequest();
        const submit = this.getSubmitFunction();

        submit(request)
            .then(({data}) => {
                this.entities.chatInvites.insert(data);
                this.showSuccessLabel();
                this.afterSubmit();
            })
            .catch(error => this.setError(getInitialApiErrorFromResponse(error)))
            .finally(() => this.setPending(false));
    }

    protected abstract getSubmitFunction(): <R extends ChatInviteRequest>(request: R) => AxiosPromise<ChatInvite>;

    protected afterSubmit(): void {

    }

    protected validateForm(): boolean {
        this.setFormErrors({
            name: validateInviteName(this.formValues.name),
            maxUseTimes: validateMaxUseTimes(this.formValues.maxUseTimes),
            active: undefined,
            expiresAt: undefined,
            joinAllowanceSettings: undefined,
            userId: undefined
        });

        return !containsNotUndefinedValues(this.formErrors);
    }

    protected convertToApiRequest(): ChatInviteRequest {
        return {
            name: isStringEmpty(this.formValues.name)
                ? undefined
                : this.formValues.name,
            active: this.formValues.active,
            expiresAt: this.formValues.expiresAt ? this.formValues.expiresAt.toISOString() : undefined,
            joinAllowanceSettings: this.formValues.joinAllowanceSettings,
            maxUseTimes: this.formValues.maxUseTimes ? Number(this.formValues.maxUseTimes) : undefined,
            userId: this.selectedUser.selectedUser?.id
        }
    }

    protected showSuccessLabel(): void {
        this.snackbarService.enqueueSnackbar(this.localeStore.getCurrentLanguageLabel(this.getSuccessLabel()));
    }

    protected abstract getSuccessLabel(): keyof Labels;
}