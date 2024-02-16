import {action, makeObservable, observable} from "mobx";
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

export class CreateChatInviteStore extends AbstractChatInviteFormStore {
    createChatInviteDialogOpen = false;

    public constructor(chatStore: ChatStore,
                       entities: EntitiesStore,
                       selectedUser: SelectUserStore,
                       localeStore: LocaleStore,
                       snackbarService: SnackbarService) {
        super(chatStore, entities, selectedUser, localeStore, snackbarService);

        makeObservable(this, {
            createChatInviteDialogOpen: observable,
            setCreateChatInviteDialogOpen: action
        });
    }

    setCreateChatInviteDialogOpen = (createChatInviteDialogOpen: boolean): void => {
        this.createChatInviteDialogOpen = createChatInviteDialogOpen;
    }

    protected getSubmitFunction(): <R extends ChatInviteRequest>(request: R) => AxiosPromise<ChatInvite>  {
        return request => ChatInviteApi.createChatInvite(this.selectedChatId!, request);
    }

    protected getSuccessLabel(): keyof Labels {
        return "chat.invite.create.success";
    }

    protected afterSubmit = (): void => {
        this.setCreateChatInviteDialogOpen(false);
    }
}