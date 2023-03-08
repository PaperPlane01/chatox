import {makeAutoObservable} from "mobx";
import {createTransformer} from "mobx-utils";
import {EntitiesStore} from "../../entities-store";
import {AuthorizationStore} from "../../Authorization";
import {UserChatRolesStore} from "../../ChatRole";
import {CurrentUser} from "../../api/types/response";
import {isBetween} from "../../utils/number-utils";

export class ChatParticipantPermissions {
    get currentUser(): CurrentUser | undefined {
        return this.authorization.currentUser;
    }

    constructor(private readonly entities: EntitiesStore,
                private readonly authorization: AuthorizationStore,
                private readonly userChatRoles: UserChatRolesStore) {
        makeAutoObservable(this);
    }

    canKickChatParticipant = createTransformer((chatParticipantId: string): boolean => {
        if (!this.currentUser) {
            return false;
        }

        const chatParticipant = this.entities.chatParticipations.findById(chatParticipantId);

        if (!this.entities.chatParticipations.existsByUserAndChat({userId: this.currentUser.id, chatId: chatParticipant.chatId})) {
            return false;
        }

        const currentUserRole = this.userChatRoles.getRoleOfUserInChat({
            chatId: chatParticipant.chatId,
            userId: this.currentUser.id
        })!;

        if (!currentUserRole.features.kickUsers.enabled) {
            return false;
        }

        const otherUserRole = this.entities.chatRoles.findById(chatParticipant.roleId);

        if (!otherUserRole.features.kickImmunity.enabled) {
            return true;
        }

        const immuneFromLevel = otherUserRole.features.kickImmunity.additional.fromLevel;
        const immuneToLevel = otherUserRole.features.kickImmunity.additional.upToLevel;
        const currentUserLevel = currentUserRole.level;

        return isBetween(
            currentUserLevel,
            {
                lowerBound: {
                    value: immuneFromLevel,
                    mode: "inclusive"
                },
                upperBound: {
                    value: immuneToLevel,
                    mode: "inclusive"
                }
            }
        );
    });

    canModifyChatParticipant = createTransformer((parameters: {chatId: string, chatParticipantId: string}): boolean => {
        if (!this.currentUser) {
            return false;
        }

        const {chatId, chatParticipantId} = parameters;

        const currentUserChatParticipation = this.entities.chatParticipations.findByUserAndChat({
            userId: this.currentUser.id,
            chatId
        });

        if (!currentUserChatParticipation || currentUserChatParticipation.id === chatParticipantId) {
            return false;
        }

        return this.canAssignRole(chatId);
    });

    canAssignRole = createTransformer((chatId: string): boolean => {
        if (!this.currentUser) {
            return false;
        }

        if (!this.entities.chatParticipations.existsByUserAndChat({chatId, userId: this.currentUser.id})) {
            return false;
        }

        const chatRole = this.userChatRoles.getRoleOfUserInChat({
            chatId,
            userId: this.currentUser.id
        })!;

        return chatRole.features.assignChatRole.enabled;
    });

    getPossibleAssignedRolesRange = createTransformer((chatId: string): {fromLevel?: number, upToLevel?: number} => {
        return this.userChatRoles.getRoleOfUserInChat({
            chatId,
            userId: this.currentUser!.id
        })?.features.assignChatRole.additional || {fromLevel: undefined, upToLevel: undefined}
    });
}