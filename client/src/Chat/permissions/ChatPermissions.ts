import {computed} from "mobx";
import {createTransformer} from "mobx-utils";
import {ChatOfCurrentUserEntity} from "../types";
import {EntitiesStore} from "../../entities-store";
import {AuthorizationStore} from "../../Authorization";
import {UserChatRolesStore} from "../../ChatRole";
import {CurrentUser, UserRole} from "../../api/types/response";

export class ChatPermissions {
    @computed
    get currentUser(): CurrentUser | undefined {
        return this.authorization.currentUser;
    }

    @computed
    get canCreateChat(): boolean {
        if (!this.currentUser) {
            return false;
        }

        return !this.authorization.isCurrentUserBannedGlobally();
    }

    constructor(private readonly entities: EntitiesStore,
                private readonly authorization: AuthorizationStore,
                private readonly userChatRoles: UserChatRolesStore) {
    }

    canUpdateChat = createTransformer((chatId: string): boolean => {
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

    canDeleteChat = createTransformer((chat: ChatOfCurrentUserEntity): boolean => {
        if (!this.currentUser) {
            return false;
        }

        return chat.createdByCurrentUser || this.currentUser.roles.includes(UserRole.ROLE_ADMIN);
    });

    canLeaveChat = createTransformer((chatId: string): boolean => {
        if (!this.currentUser) {
            return false;
        }

        return this.entities.chatParticipations.existsByUserAndChat({
            userId: this.currentUser.id,
            chatId
        });
    });
}