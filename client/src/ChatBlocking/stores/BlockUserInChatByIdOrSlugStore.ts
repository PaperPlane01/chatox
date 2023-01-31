import {makeAutoObservable, reaction} from "mobx";
import {CreateChatBlockingStore} from "./CreateChatBlockingStore";
import {EntitiesStore} from "../../entities-store";
import {ApiError, getInitialApiErrorFromResponse, UserApi} from "../../api";
import {isStringEmpty} from "../../utils/string-utils";

export class BlockUserInChatByIdOrSlugStore {
    userIdOrSlug: string = "";

    blockUserInChatByIdOrSlugDialogOpen: boolean = false;

    checkingUser: boolean = false;

    error?: ApiError = undefined;

    constructor(private readonly entities: EntitiesStore,
                private readonly createChatBlockingStore: CreateChatBlockingStore) {
        makeAutoObservable(this);

        reaction(
            () => this.userIdOrSlug,
            () => this.checkUser()
        )
    }

    setBlockUserInChatByIdOrSlugDialogOpen = (blockUserInChatByIdOrSlugDialogOpen: boolean): void => {
        this.blockUserInChatByIdOrSlugDialogOpen = blockUserInChatByIdOrSlugDialogOpen;
    };

    setUserIdOrSlug = (userIdOrSlug: string): void => {
        this.userIdOrSlug = userIdOrSlug;
    };

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
    };
}
