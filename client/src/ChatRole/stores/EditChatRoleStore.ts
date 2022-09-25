import {action, observable, reaction, runInAction} from "mobx";
import {ChatFeaturesFormStore} from "./ChatFeaturesFormStore";
import {ChatRoleInfoDialogStore} from "./ChatRoleInfoDialogStore";
import {ChatRoleEntity, EditChatRoleFormData} from "../types";
import {validateRoleName, validateRoleLevel} from "../validation";
import {AbstractFormStore} from "../../form-store";
import {FormErrors} from "../../utils/types";
import {EntitiesStore} from "../../entities-store";
import {ChatRoleApi, getInitialApiErrorFromResponse} from "../../api";
import {UpdateChatRoleRequest} from "../../api/types/request";

const INITIAL_FORM_VALUES: EditChatRoleFormData = {
    name: "",
    level: "0"
};
const INITIAL_FORM_ERRORS: FormErrors<EditChatRoleFormData> = {
    name: undefined,
    level: undefined
};

export class EditChatRoleStore extends AbstractFormStore<EditChatRoleFormData> {
    @observable
    roleId?: string = undefined;

    @observable
    showSnackbar: boolean = false;

    constructor(private readonly chatFeaturesForm: ChatFeaturesFormStore,
                private readonly entities: EntitiesStore,
                private readonly chatRoleInfoDialog: ChatRoleInfoDialogStore) {
        super(INITIAL_FORM_VALUES, INITIAL_FORM_ERRORS);

        reaction(
            () => this.roleId,
            roleId => {
                if (roleId) {
                    const chatRole = entities.chatRoles.findById(roleId);
                    this.populateFromRole(chatRole);
                } else {
                    this.resetForm();
                }
            }
        );
        reaction(
            () => this.formValues.name,
            name => this.setFormError("name", validateRoleName(name))
        );
        reaction(
            () => this.formValues.level,
            level => this.setFormError("level", validateRoleLevel(level))
        );
    }

    @action
    setRoleId = (roleId: string | undefined): void => {
        this.roleId = roleId;
        this.chatFeaturesForm.setRoleId(roleId);
    }

    @action
    setShowSnackbar = (showSnackbar: boolean): void => {
        this.showSnackbar = showSnackbar;
    }

    @action
    populateFromRole = (role: ChatRoleEntity): void => {
        this.setForm({
            name: role.name,
            level:`${role.level}`
        });
    }

    @action
    submitForm = (): void => {
        if (!this.roleId) {
            return;
        }

        if (!this.validateForm()) {
            return;
        }

        const role = this.entities.chatRoles.findById(this.roleId);
        this.pending = true;
        this.error = undefined;

        const request = this.convertToApiRequest();

        ChatRoleApi.updateChatRole(
            role.chatId,
            role.id,
            request
        )
            .then(({data}) => {
                this.entities.insertChatRole(data);
                this.chatRoleInfoDialog.setEditMode(false);
                this.resetForm();
                this.setShowSnackbar(true);
            })
            .catch(error => runInAction(() => this.error = getInitialApiErrorFromResponse(error)))
            .finally(() => runInAction(() => this.pending = false));
    }

    @action
    protected validateForm = (): boolean => {
        this.setFormErrors({
            name: validateRoleName(this.formValues.name),
            level: validateRoleLevel(this.formValues.level)
        });

        return !Boolean(this.formErrors.name && this.formValues.level) && this.chatFeaturesForm.validateForms();
    }

    private convertToApiRequest = (): UpdateChatRoleRequest => {
        const features = this.chatFeaturesForm.convertToApiRequest();

        return {
            name: this.formValues.name,
            level: Number(this.formValues.level),
            features
        };
    }
}