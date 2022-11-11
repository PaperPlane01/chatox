import {action, computed, observable, reaction, runInAction} from "mobx";
import {ChatParticipationEntity, UpdateChatParticipantFormData} from "../types";
import {EntitiesStore} from "../../entities-store";
import {ApiError, ChatApi, ChatRoleApi, getInitialApiErrorFromResponse} from "../../api";
import {AbstractFormStore} from "../../form-store";
import {FormErrors} from "../../utils/types";
import {UserChatRolesStore} from "../../ChatRole";
import {ChatParticipantPermissions} from "../permissions";
import {AuthorizationStore} from "../../Authorization";
import {isBetween} from "../../utils/number-utils";

const INITIAL_FORM_VALUES: UpdateChatParticipantFormData = {
    roleId: ""
};
const INITIAL_FORM_ERRORS: FormErrors<UpdateChatParticipantFormData> = {
    roleId: undefined
};

export class UpdateChatParticipantStore extends AbstractFormStore<UpdateChatParticipantFormData>{
    @observable
    updatedParticipantId?: string = undefined;

    @observable
    updateChatParticipantDialogOpen: boolean = false;

    @observable
    pending: boolean = false;

    @observable
    showSnackbar: boolean = false;

    @observable
    error?: ApiError = undefined;

    @observable
    fetchingChatRoles: boolean = false;

    @observable
    fetchingChatRolesError?: ApiError = undefined;

    @computed
    get updatedParticipant(): ChatParticipationEntity | undefined {
        if (!this.updatedParticipantId) {
            return undefined;
        }

        return this.entities.chatParticipations.findById(this.updatedParticipantId);
    }

    @computed
    get chatId(): string | undefined {
        if (!this.updatedParticipant) {
            return undefined;
        }

        return this.updatedParticipant.chatId;
    }

    @computed
    get assignableRoles(): string[] {
        if (!this.chatId) {
            return [];
        }

        //todo: Inject ChatRolePermissions via constructor or setter
        const chatParticipantPermissions = new ChatParticipantPermissions(
            this.entities,
            this.authorization,
            this.userChatRoles
        );
        const allowedLevels = chatParticipantPermissions.getPossibleAssignedRolesRange(this.chatId);
        const chatRoles = this.entities.chatRoles.findAllByChat(this.chatId);

        return chatRoles
            .filter(role => isBetween(
                role.level,
                {
                    lowerBound: {
                        value: allowedLevels.fromLevel,
                        mode: "inclusive"
                    },
                    upperBound: {
                        value: allowedLevels.upToLevel,
                        mode: "inclusive"
                    }
                }
            ))
            .map(role => role.id);
    }

    constructor(private readonly entities: EntitiesStore,
                private readonly authorization: AuthorizationStore,
                private readonly userChatRoles: UserChatRolesStore) {
        super(INITIAL_FORM_VALUES, INITIAL_FORM_ERRORS);

        reaction(
            () => this.updatedParticipant,
            participant => {
                if (participant) {
                    this.setFormValue("roleId", participant.roleId);
                } else {
                    this.setFormValue("roleId", "");
                }
            }
        );

        reaction(
            () => this.updateChatParticipantDialogOpen,
            open => {
                if (open) {
                    this.fetchChatRoles();
                }
            }
        )
    }

    @action
    fetchChatRoles = (): void => {
        if (!this.chatId) {
            return;
        }

        this.fetchingChatRoles = true;
        this.fetchingChatRolesError = undefined;

        ChatRoleApi.getRolesOfChat(this.chatId)
            .then(({data}) => this.entities.chatRoles.insertAll(data))
            .catch(error => runInAction(() => this.fetchingChatRolesError = getInitialApiErrorFromResponse(error)))
            .finally(() => runInAction(() => this.fetchingChatRoles = false));
    }

    @action
    setUpdatedParticipantId = (participantId?: string): void => {
        this.updatedParticipantId = participantId;
    }

    @action
    setUpdateChatParticipantDialogOpen = (updateChatParticipantDialogOpen: boolean): void => {
        this.updateChatParticipantDialogOpen = updateChatParticipantDialogOpen;
    }

    @action
    setShowSnackbar = (showSnackbar: boolean): void => {
        this.showSnackbar = showSnackbar;
    }

    @action
    submitForm = (): void => {
        if (!this.updatedParticipant || !this.chatId) {
            return;
        }

        this.pending = true;
        this.error = undefined;

        ChatApi.updateChatParticipant(this.chatId, this.updatedParticipant.id, {
            roleId: this.formValues.roleId
        })
            .then(({data}) => {
                this.entities.chatParticipations.insert(data);
                this.setUpdateChatParticipantDialogOpen(false);
                this.setUpdatedParticipantId(undefined);
                this.setShowSnackbar(true);
            })
            .catch(error => runInAction(() => this.error = getInitialApiErrorFromResponse(error)))
            .finally(() => runInAction(() => this.pending = false));
    }

    protected validateForm(): boolean {
        return true;
    }
}
