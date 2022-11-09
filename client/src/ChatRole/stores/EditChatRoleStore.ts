import {action, computed, observable, reaction} from "mobx";
import {ChatFeaturesFormStore} from "./ChatFeaturesFormStore";
import {ChatRoleInfoDialogStore} from "./ChatRoleInfoDialogStore";
import {AbstractChatRoleFormStore} from "./AbstractChatRoleFormStore";
import {ChatRoleEntity} from "../types";
import {EntitiesStoreV2} from "../../entities-store";
import {ChatRoleApi, getInitialApiErrorFromResponse} from "../../api";
import {Labels, LocaleStore} from "../../localization";
import {UpdateChatRoleRequest} from "../../api/types/request";
import {SnackbarService} from "../../Snackbar";

export class EditChatRoleStore extends AbstractChatRoleFormStore {
    @observable
    roleId?: string = undefined;

    @observable
    defaultRoleId?: string = undefined;

    @observable
    defaultRoleError?: keyof  Labels = undefined;

    @computed
    get requireDefaultRole(): boolean {
        if (!this.roleId) {
            return false;
        }

        const role = this.entities.chatRoles.findById(this.roleId);

        return role.default && !this.formValues.default;
    }

    constructor(chatFeaturesForm: ChatFeaturesFormStore,
                entities: EntitiesStoreV2,
                localeStore: LocaleStore,
                snackbarService: SnackbarService,
                private readonly chatRoleInfoDialog: ChatRoleInfoDialogStore,) {
        super(chatFeaturesForm, entities, localeStore, snackbarService);

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
    }

    @action
    setRoleId = (roleId: string | undefined): void => {
        this.roleId = roleId;
        this.chatFeaturesForm.setRoleId(roleId);
    }

    @action
    setDefaultRoleId = (defaultRoleId?: string): void => {
        this.defaultRoleId = defaultRoleId;
    }

    @action
    populateFromRole = (role: ChatRoleEntity): void => {
        this.setForm({
            name: role.name,
            level:`${role.level}`,
            default: role.default
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
        this.setPending(true);
        this.setError(undefined);

        const request = this.convertToApiRequest();

        ChatRoleApi.updateChatRole(
            role.chatId,
            role.id,
            request
        )
            .then(({data}) => {
                this.entities.chatRoles.insert(data);
                this.chatRoleInfoDialog.setEditMode(false);
                this.resetForm();
                this.showSuccessLabel();
            })
            .catch(error => this.setError(getInitialApiErrorFromResponse(error)))
            .finally(() => this.setPending(false));
    }


    @action.bound
    protected validateForm(): boolean {
        const formValidationResult = super.validateForm();

        if (this.requireDefaultRole && !this.defaultRoleId) {
            this.defaultRoleError = "chat.role.default-role.required";
        }

        return formValidationResult && !this.defaultRoleError;
    }

    protected convertToApiRequest(): UpdateChatRoleRequest {
        return  {
            ...super.convertToApiRequest(),
            defaultRoleId: this.defaultRoleId
        };
    }

    @action.bound
    protected resetForm() {
        super.resetForm();
        this.defaultRoleId = undefined;
        this.defaultRoleError = undefined;
    }

    protected getSuccessLabel(): keyof Labels {
        return "chat.role.update.success";
    }
}