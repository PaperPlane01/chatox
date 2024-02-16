import {makeAutoObservable} from "mobx";
import {computedFn} from "mobx-utils";
import {EntitiesStore} from "../../entities-store";
import {AuthorizationStore} from "../../Authorization";
import {UserChatRolesStore} from "../../ChatRole";
import {CurrentUser} from "../../api/types/response";
import {isBetween} from "../../utils/number-utils";

export class ChatBlockingPermissions {
    get currentUser(): CurrentUser | undefined {
        return this.authorization.currentUser;
    }

    constructor(private readonly entities: EntitiesStore,
                private readonly authorization: AuthorizationStore,
                private readonly userChatRoles: UserChatRolesStore) {
        makeAutoObservable(this);
    }

    canBlockUsersInChat = computedFn((chatId: string): boolean => {
        if (!this.currentUser) {
            return false;
        }

        if (!this.entities.chatParticipations.existsByUserAndChat({userId: this.currentUser.id, chatId})) {
            return false;
        }

        const chatRole = this.userChatRoles.getRoleOfUserInChat({
            userId: this.currentUser.id,
            chatId
        })!;

        return chatRole.features.blockUsers.enabled;
    });

    canBlockUserInChat = computedFn((chatId: string, userId: string): boolean => {
        if (!this.canBlockUsersInChat(chatId)) {
            return false;
        }

        const otherUserRole = this.userChatRoles.getRoleOfUserInChat({
            userId,
            chatId
        });

        if (!otherUserRole) {
            return true;
        }

        if (!otherUserRole.features.blockingImmunity.enabled) {
            return true;
        }

        const immuneFromLevel = otherUserRole.features.blockingImmunity.additional.fromLevel;
        const immuneToLevel = otherUserRole.features.blockingImmunity.additional.upToLevel;
        const currentUserRole = this.userChatRoles.getRoleOfUserInChat({
            userId: this.currentUser!.id,
            chatId
        })!;

        return isBetween(
            currentUserRole.level,
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
}