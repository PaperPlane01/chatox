import {makeAutoObservable} from "mobx";
import {computedFn} from "mobx-utils";
import {ChatOfCurrentUserEntity} from "../types";
import {EntitiesStore} from "../../entities-store";
import {AuthorizationStore} from "../../Authorization";
import {UserChatRolesStore} from "../../ChatRole";
import {ChatFeatures, CurrentUser, UserRole} from "../../api/types/response";
import {isDefined} from "../../utils/object-utils";

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
        if (!this.checkRoleExistenceAndGlobalBanAbsence(chatId, this.currentUser)) {
            return false;
        }

        const chatRole = this.userChatRoles.getRoleOfUserInChat({
            userId: this.currentUser.id,
            chatId
        })!;

        return chatRole.features.changeChatSettings.enabled;
    });

    hasAccessToChatManagementPage = computedFn((chatId: string): boolean => {
        if (!this.checkRoleExistenceAndGlobalBanAbsence(chatId, this.currentUser)) {
            return false;
        }

        const chatRole = this.userChatRoles.getRoleOfUserInChat({
            userId: this.currentUser.id,
            chatId
        })!;

        const features: Array<keyof ChatFeatures> = [
            "blockUsers",
            "changeChatSettings",
            "modifyChatRoles",
            "deleteChat"
        ];

        return isDefined(features.find(feature => chatRole.features[feature].enabled));
    });

    private checkRoleExistenceAndGlobalBanAbsence = computedFn((chatId: string, user?: CurrentUser): user is CurrentUser => {
        if (!user) {
            return false;
        }

        if (this.authorization.isCurrentUserBannedGlobally()) {
            return false;
        }

        return this.entities.chatParticipations.existsByUserAndChat({userId: user.id, chatId});
    })

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