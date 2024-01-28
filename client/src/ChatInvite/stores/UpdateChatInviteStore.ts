import {action, makeObservable, observable, reaction} from "mobx";
import {AxiosPromise} from "axios";
import {AbstractChatInviteFormStore} from "./AbstractChatInviteFormStore";
import {ChatInviteApi} from "../../api";
import {ChatInviteRequest} from "../../api/types/request";
import {ChatInvite} from "../../api/types/response";
import {Labels, LocaleStore} from "../../localization";
import {ChatStore} from "../../Chat";
import {EntitiesStore} from "../../entities-store";
import {SelectUserStore} from "../../UserSelect";
import {SnackbarService} from "../../Snackbar";

export class UpdateChatInviteStore extends AbstractChatInviteFormStore {
    chatInviteId?: string = undefined;

    updateChatInviteDialogOpen = false;

    constructor(chatStore: ChatStore,
                entities: EntitiesStore,
                selectedUser: SelectUserStore,
                localeStore: LocaleStore,
                snackbarService: SnackbarService) {
        super(chatStore, entities, selectedUser, localeStore, snackbarService)

        makeObservable(this, {
            chatInviteId: observable,
            updateChatInviteDialogOpen: observable,
            setChatInviteId: action,
            setUpdateChatInviteDialogOpen: action,
            populateFromEntity: action
        });

        reaction(
            () => this.chatInviteId,
            () => this.populateFromEntity()
        );
    }

    setChatInviteId = (chatInviteId?: string): void => {
        this.chatInviteId = chatInviteId;
    }

    setUpdateChatInviteDialogOpen = (updateChatInviteDialogOpen: boolean): void => {
        this.updateChatInviteDialogOpen = updateChatInviteDialogOpen;
    }

    populateFromEntity = (): void => {
        if (!this.chatInviteId) {
            this.resetForm();
            this.selectedUser.reset();
            return;
        }

        const chatInvite = this.entities.chatInvites.findById(this.chatInviteId);

        if (chatInvite.userId) {
            this.selectedUser.setSelectedUser(this.entities.users.findById(chatInvite.userId));
        }

        this.setForm({
            active: chatInvite.active,
            expiresAt: chatInvite.expiresAt,
            joinAllowanceSettings: chatInvite.joinAllowanceSettings,
            maxUseTimes: chatInvite.maxUseTimes?.toString(),
            name: chatInvite.name,
            userId: chatInvite.userId
        });
    }

    protected getSubmitFunction(): <R extends ChatInviteRequest>(request: R) => AxiosPromise<ChatInvite> {
        return request => ChatInviteApi.updateChatInvite(this.selectedChatId!, this.chatInviteId!, request);
    }

    protected getSuccessLabel(): keyof Labels {
        return "chat.invite.update.success";
    }

    protected afterSubmit = (): void => {
        this.setUpdateChatInviteDialogOpen(false);
        this.setChatInviteId(undefined);
    }
}