import {makeAutoObservable} from "mobx";
import {computedFn} from "mobx-utils";
import {ChatOfCurrentUserEntity} from "../types";
import {EntitiesStore} from "../../entities-store";
import {AuthorizationStore} from "../../Authorization";
import {UserChatRolesStore} from "../../ChatRole";
import {CurrentUser, UserRole} from "../../api/types/response";

export class ChatPermissions {
    get currentUser(): CurrentUser | undefined {
        return this.authorization.currentUser;
    }

    get canCreateChat(): boolean {
        if (!this.currentUser) {
            return false;
        }

        return !this.authorization.isCurrentUserBannedGlobally();
    }

    constructor(private readonly entities: EntitiesStore,
                private readonly authorization: AuthorizationStore,
                private readonly userChatRoles: UserChatRolesStore) {
        makeAutoObservable(this);
    }

    canUpdateChat = computedFn((chatId: string): boolean => {
        if (!this.currentUser) {
            return false;
        }

        if (this.authorization.isCurrentUserBannedGlobally()) {
            return false;
        }

        if (!this.entities.chatParticipations.existsByUserAndChat({userId: this.currentUser.id, chatId})) {
            return false;
        }

        const chatRole = this.userChatRoles.getRoleOfUserInChat({
            userId: this.currentUser.id,
            chatId
        })!;

        return chatRole.features.changeChatSettings.enabled;
    });

    canDeleteChat = computedFn((chat: ChatOfCurrentUserEntity): boolean => {
        if (!this.currentUser) {
            return false;
        }

        return chat.createdByCurrentUser || this.currentUser.roles.includes(UserRole.ROLE_ADMIN);
    });

    canLeaveChat = computedFn((chatId: string): boolean => {
        if (!this.currentUser) {
            return false;
        }

        return this.entities.chatParticipations.existsByUserAndChat({
            userId: this.currentUser.id,
            chatId
        });
    });
}