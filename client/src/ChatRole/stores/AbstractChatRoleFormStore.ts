import {action, reaction} from "mobx";
import {ChatFeaturesFormStore} from "./ChatFeaturesFormStore";
import {ChatRoleFormData} from "../types";
import {validateRoleLevel, validateRoleName} from "../validation";
import {AbstractFormStore} from "../../form-store";
import {FormErrors} from "../../utils/types";
import {CreateChatRoleRequest} from "../../api/types/request";
import {EntitiesStoreV2} from "../../entities-store";
import {Labels, LocaleStore} from "../../localization";
import {SnackbarService} from "../../Snackbar";

const INITIAL_FORM_VALUES: ChatRoleFormData = {
    name: "",
    level: "0",
    default: false
};
const INITIAL_FORM_ERRORS: FormErrors<ChatRoleFormData> = {
    name: undefined,
    level: undefined,
    default: undefined
};

export abstract class AbstractChatRoleFormStore extends AbstractFormStore<ChatRoleFormData> {
    protected constructor(protected readonly chatFeaturesForm: ChatFeaturesFormStore,
                          protected readonly entities: EntitiesStoreV2,
                          private readonly localeStore: LocaleStore,
                          private readonly snackbarService: SnackbarService) {
        super(INITIAL_FORM_VALUES, INITIAL_FORM_ERRORS);

        reaction(
            () => this.formValues.name,
            name => this.setFormError("name", validateRoleName(name))
        );
        reaction(
            () => this.formValues.level,
            level => this.setFormError("level", validateRoleLevel(level))
        );
    }

    @action.bound
    protected validateForm(): boolean {
        this.setFormErrors({
            name: validateRoleName(this.formValues.name),
            level: validateRoleLevel(this.formValues.level),
            default: undefined
        });

        return !Boolean(this.formErrors.name && this.formValues.level) && this.chatFeaturesForm.validateForms();
    }

    protected convertToApiRequest(): CreateChatRoleRequest {
        const features = this.chatFeaturesForm.convertToApiRequest();

        return {
            name: this.formValues.name,
            level: Number(this.formValues.level),
            default: this.formValues.default,
            features
        };
    }

    protected abstract getSuccessLabel(): keyof Labels;

    protected showSuccessLabel(): void {
        this.snackbarService.enqueueSnackbar(this.localeStore.currentLanguageLabels[this.getSuccessLabel()]);
    }
}