import {computed} from "mobx";
import {createTransformer} from "mobx-utils";
import {EntitiesStoreV2} from "../../entities-store";
import {AuthorizationStore} from "../../Authorization";
import {UserChatRolesStore} from "../../ChatRole";
import {CurrentUser} from "../../api/types/response";
import {isBetween} from "../../utils/number-utils";

export class ChatBlockingPermissions {
    @computed
    get currentUser(): CurrentUser | undefined {
        return this.authorization.currentUser;
    }

    constructor(private readonly entities: EntitiesStoreV2,
                private readonly authorization: AuthorizationStore,
                private readonly userChatRoles: UserChatRolesStore) {
    }

    canBlockUsersInChat = createTransformer((chatId: string): boolean => {
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

    canBlockUserInChat = createTransformer((parameters: {userId: string, chatId: string}): boolean => {
        const {chatId, userId} = parameters;
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