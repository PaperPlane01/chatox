import {makeAutoObservable} from "mobx";
import {computedFn} from "mobx-utils";
import type {AuthorizationStore} from "../../Authorization/stores";
import type {UserChatRolesStore} from "../../ChatRole/stores";
import {CurrentUser} from "../../api/types/response";

export class ChatInvitePermissions {
    get currentUser(): CurrentUser | undefined {
        return this.authorization.currentUser;
    }

    constructor(private readonly authorization: AuthorizationStore,
                private readonly userChatRoles: UserChatRolesStore) {
        makeAutoObservable(this);
    }

    canManageInvites = computedFn((chatId: string): boolean => {
        if (!this.currentUser) {
            return false;
        }

        const role = this.userChatRoles.getRoleOfUserInChat({
            userId: this.currentUser.id,
            chatId
        });

        if (!role) {
            return false;
        }

        return role.features.manageInvites.enabled;
    })
}