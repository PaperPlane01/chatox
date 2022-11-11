import {action, computed, observable} from "mobx";
import {AbstractChatRoleFormStore} from "./AbstractChatRoleFormStore";
import {ChatFeaturesFormStore} from "./ChatFeaturesFormStore";
import {RolesOfChatStore} from "./RolesOfChatStore";
import {EntitiesStore} from "../../entities-store";
import {ChatRoleApi, getInitialApiErrorFromResponse} from "../../api";
import {ChatOfCurrentUserEntity, ChatStore} from "../../Chat";
import {SnackbarService} from "../../Snackbar";
import {Labels, LocaleStore} from "../../localization";

export class CreateChatRoleStore extends AbstractChatRoleFormStore {
    @observable
    createChatRoleDialogOpen: boolean = false;

    @computed
    get selectedChatId(): string | undefined {
        return this.chatStore.selectedChatId;
    }

    @computed
    get selectedChat(): ChatOfCurrentUserEntity | undefined {
        if (!this.selectedChatId) {
            return undefined;
        }

        return this.entities.chats.findById(this.selectedChatId);
    }

    constructor(chatFeaturesForm: ChatFeaturesFormStore,
                entities: EntitiesStore,
                localeStore: LocaleStore,
                snackbarService: SnackbarService,
                private readonly chatStore: ChatStore,
                private readonly rolesOfChatStore: RolesOfChatStore,) {
        super(chatFeaturesForm, entities, localeStore, snackbarService);
    }

    @action
    setCreateChatRoleDialogOpen = (createChatRoleDialogOpen: boolean): void => {
        this.chatFeaturesForm.clearRoleId();
        this.createChatRoleDialogOpen = createChatRoleDialogOpen;
    }

    @action
    openRolesList = (): void => {
        this.setCreateChatRoleDialogOpen(false);
        this.rolesOfChatStore.openRolesList();
    }

    @action
    submitForm = (): void => {
        if (!this.selectedChatId) {
            return;
        }

        if (!this.validateForm()) {
            return;
        }

        this.setPending(true);
        this.setError(undefined);

        const apiRequest = this.convertToApiRequest();

        ChatRoleApi
            .createChatRole(this.selectedChatId, apiRequest)
            .then(({data}) => {
                this.entities.chatRoles.insert(data);
                this.showSuccessLabel();
                this.openRolesList();
            })
            .catch(error => this.setError(getInitialApiErrorFromResponse(error)))
            .finally(() => this.setPending(false));
    }

    protected getSuccessLabel(): keyof Labels {
        return "chat.role.create.success";
    }
}