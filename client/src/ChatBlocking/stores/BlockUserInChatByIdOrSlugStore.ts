import {action, observable, reaction} from "mobx";
import {CreateChatBlockingStore} from "./CreateChatBlockingStore";
import {EntitiesStoreV2} from "../../entities-store";
import {ApiError, getInitialApiErrorFromResponse, UserApi} from "../../api";
import {isStringEmpty} from "../../utils/string-utils";

export class BlockUserInChatByIdOrSlugStore {
    @observable
    userIdOrSlug: string = "";

    @observable
    blockUserInChatByIdOrSlugDialogOpen: boolean = false;

    @observable
    checkingUser: boolean = false;

    @observable
    error?: ApiError = undefined;

    constructor(private readonly entities: EntitiesStoreV2,
                private readonly createChatBlockingStore: CreateChatBlockingStore) {
        reaction(
            () => this.userIdOrSlug,
            () => this.checkUser()
        )
    }

    @action
    setBlockUserInChatByIdOrSlugDialogOpen = (blockUserInChatByIdOrSlugDialogOpen: boolean): void => {
        this.blockUserInChatByIdOrSlugDialogOpen = blockUserInChatByIdOrSlugDialogOpen;
    };

    @action
    setUserIdOrSlug = (userIdOrSlug: string): void => {
        this.userIdOrSlug = userIdOrSlug;
    };

    @action
    checkUser = (): void => {
        if (!isStringEmpty(this.userIdOrSlug)) {
            let user = this.entities.users.findByIdOrSlug(this.userIdOrSlug);

            if (user) {
                this.createChatBlockingStore.setFormValue("blockedUserId", user.id);
                this.setBlockUserInChatByIdOrSlugDialogOpen(false);
                this.createChatBlockingStore.setCreateChatBlockingDialogOpen(true);
            } else {
                this.checkingUser = true;
                this.error = undefined;

                UserApi.getUserByIdOrSlug(this.userIdOrSlug)
                    .then(({data}) => {
                        user = this.entities.users.insert(data);
                        this.setBlockUserInChatByIdOrSlugDialogOpen(false);
                        this.createChatBlockingStore.setFormValue("blockedUserId", user.id);
                        this.createChatBlockingStore.setCreateChatBlockingDialogOpen(true);
                    })
                    .catch(error => this.error = getInitialApiErrorFromResponse(error))
                    .finally(() => this.checkingUser = false);
            }
        }
    }
}
