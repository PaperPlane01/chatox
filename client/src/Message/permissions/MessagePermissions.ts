import {computed} from "mobx";
import {createTransformer} from "mobx-utils";
import {differenceInDays, isBefore} from "date-fns";
import {MessageEntity} from "../types";
import {EntitiesStoreV2} from "../../entities-store";
import {AuthorizationStore} from "../../Authorization";
import {UserChatRolesStore} from "../../ChatRole";
import {ChatParticipationEntity} from "../../Chat";
import {CurrentUser} from "../../api/types/response";
import {ChatRoleEntity} from "../../ChatRole/types";
import {isBetween} from "../../utils/number-utils";

type SendMessagesPermission = "allowedToSendAudios" | "allowedToSendStickers" | "allowedToSendImages"
    | "allowedToSendFiles" | "allowedToSendVoiceMessages" | "allowedToSendVideos";

export class MessagePermissions {
    constructor(private readonly entities: EntitiesStoreV2,
                private readonly authorization: AuthorizationStore,
                private readonly userChatRoles: UserChatRolesStore) {
    }

    @computed
    get currentUser(): CurrentUser | undefined {
        return this.authorization.currentUser;
    }

    canEditMessage = createTransformer((message: MessageEntity): boolean => {
        if (!this.currentUser) {
            return false;
        }

        if (this.authorization.isCurrentUserBannedGlobally()) {
            return false;
        }

        if (message.sender !== this.currentUser.id) {
            return false;
        }

        if (differenceInDays(new Date(), message.createdAt) >= 1) {
            return false;
        }

        return this.canCurrentUserSendMessages(message.chatId);
    });

    canCreateMessage = createTransformer((chatId: string): boolean => {
        if (!this.currentUser) {
            return false;
        }

        if (this.authorization.isCurrentUserBannedGlobally()) {
            return false;
        }

        return this.canCurrentUserSendMessages(chatId);
    });

    canSendStickers = createTransformer((chatId: string): boolean => this.checkSendMessagesFeature({
        chatId,
        feature: "allowedToSendStickers"
    }));

    canSendImages = createTransformer((chatId: string): boolean => this.checkSendMessagesFeature({
        chatId,
        feature: "allowedToSendImages"
    }));

    canSendFiles = createTransformer((chatId: string): boolean => this.checkSendMessagesFeature({
        chatId,
        feature: "allowedToSendFiles"
    }));

    canSendVoiceMessages = createTransformer((chatId: string): boolean => this.checkSendMessagesFeature({
        chatId,
        feature: "allowedToSendVoiceMessages"
    }));

    canSendVideos = createTransformer((chatId: string): boolean => this.checkSendMessagesFeature({
        chatId,
        feature: "allowedToSendVideos"
    }));

    canSendAudios = createTransformer((chatId: string): boolean => this.checkSendMessagesFeature({
        chatId,
        feature: "allowedToSendAudios"
    }));

    private checkSendMessagesFeature = createTransformer((parameters: {chatId: string, feature: SendMessagesPermission}): boolean => {
        if (!this.currentUser || this.authorization.isCurrentUserBannedGlobally()) {
            return false;
        }

        const {chatId, feature} = parameters;

        if (!this.canCurrentUserSendMessages(chatId)) {
            return false;
        }

        const chatRole = this.getRoleOfCurrentUserInChat(chatId);

        return chatRole.features.sendMessages.additional[feature];
    });

    canDeleteMessage = createTransformer((message: MessageEntity): boolean => {
        if (!this.currentUser) {
            return false;
        }

        let currentUserChatRole: ChatRoleEntity;

        if (message.sender === this.currentUser.id) {
            currentUserChatRole = this.getRoleOfCurrentUserInChat(message.chatId);

            return currentUserChatRole.features.deleteOwnMessages.enabled;
        } else {
            if (!this.isCurrentUserParticipantOfChat(message.chatId)) {
                return false;
            }

            currentUserChatRole = this.getRoleOfCurrentUserInChat(message.chatId);

            if (!currentUserChatRole.features.deleteOtherUsersMessages.enabled) {
                return false;
            }

            const senderChatRole = this.userChatRoles.getRoleOfUserInChat({
                chatId: message.chatId,
                userId: message.sender
            })!;
            const senderMessageDeletionImmunity = senderChatRole.features.messageDeletionsImmunity;

            if (!senderMessageDeletionImmunity.enabled) {
                return true;
            }

            const immuneFromLevel = senderMessageDeletionImmunity.additional.fromLevel;
            const immuneUpToLevel = senderMessageDeletionImmunity.additional.upToLevel;
            const currentUserLevel = currentUserChatRole.level;

            return isBetween(
                currentUserLevel,
                {
                    lowerBound: {value: immuneFromLevel, mode: "inclusive"},
                    upperBound: {value: immuneUpToLevel, mode: "inclusive"}
                }
            );
        }
    });

    canUnpinMessage = createTransformer((chatId: string): boolean => this.canPinMessage(chatId));

    canPinMessage = createTransformer((chatId: string): boolean => {
        if (!this.currentUser) {
            return false;
        }

        if (!this.isCurrentUserParticipantOfChat(chatId)) {
            return false;
        }

        const chatRole = this.getRoleOfCurrentUserInChat(chatId);

        return chatRole.features.pinMessages.enabled;
    });

    canReadScheduledMessages = createTransformer((chatId: string): boolean => this.canScheduleMessage(chatId));

    canScheduleMessage = createTransformer((chatId: string): boolean => {
        if (!this.currentUser) {
            return false;
        }

        if (this.authorization.isCurrentUserBannedGlobally()) {
            return false;
        }

        if (!this.isCurrentUserParticipantOfChat(chatId)) {
            return false;
        }

        const chatRole = this.getRoleOfCurrentUserInChat(chatId);

        return chatRole.features.scheduleMessages.enabled;
    });

    canUpdateScheduledMessage = createTransformer((message: MessageEntity): boolean => {
        if (!this.canScheduleMessage(message.chatId)) {
            return false;
        }

        return message.sender === this.currentUser!.id;
    });

    canDeleteScheduledMessage = createTransformer((message: MessageEntity): boolean => {
        if (!this.canScheduleMessage(message.chatId)) {
            return false;
        }

        if (message.sender === this.currentUser!.id) {
            return true;
        }

        const currentUserRole = this.getRoleOfCurrentUserInChat(message.chatId);
        const senderRole = this.userChatRoles.getRoleOfUserInChat({
            userId: message.sender,
            chatId: message.chatId
        })!;

        return currentUserRole.level > senderRole.level;
    });

    private canCurrentUserSendMessages = createTransformer((chatId: string) => {
        const chatParticipation = this.getChatParticipationOfCurrentUser(chatId);

        if (!chatParticipation) {
            return false;
        }

        const chatRole = this.getRoleOfCurrentUserInChat(chatId);

        if (!chatRole.features.sendMessages.enabled) {
            return false;
        }

        return !this.isUserBannedInChat(chatParticipation);
    });

    private isUserBannedInChat = createTransformer((chatParticipation: ChatParticipationEntity): boolean => {
        if (!chatParticipation.activeChatBlockingId) {
            return false;
        }

        const chatBlocking = this.entities.chatBlockings.findById(chatParticipation.activeChatBlockingId);

        return !isBefore(new Date(), chatBlocking.blockedUntil);
    });

    private isCurrentUserParticipantOfChat = createTransformer(
        (chatId: string): boolean => Boolean(this.getChatParticipationOfCurrentUser(chatId))
    );

    private getChatParticipationOfCurrentUser = createTransformer(
        (chatId: string): ChatParticipationEntity | undefined => this.entities.chatParticipations.findByUserAndChat({
            userId: this.currentUser!.id,
            chatId
        })
    );

    private getRoleOfCurrentUserInChat = createTransformer(
        (chatId: string): ChatRoleEntity => this.userChatRoles.getRoleOfUserInChat({
            userId: this.currentUser!.id,
            chatId
        })!
    );
}