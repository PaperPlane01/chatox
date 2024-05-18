import {makeAutoObservable} from "mobx";
import {computedFn, createTransformer} from "mobx-utils";
import {differenceInDays, isBefore} from "date-fns";
import {MessageEntity} from "../types";
import {EntitiesStore} from "../../entities-store";
import {AuthorizationStore} from "../../Authorization";
import {UserChatRolesStore} from "../../ChatRole";
import {ChatParticipationEntity} from "../../ChatParticipant";
import {CurrentUser} from "../../api/types/response";
import {ChatRoleEntity} from "../../ChatRole/types";
import {isBetween} from "../../utils/number-utils";
import {isDefined} from "../../utils/object-utils";

type SendMessagesPermission = "allowedToSendAudios" | "allowedToSendStickers" | "allowedToSendImages"
    | "allowedToSendFiles" | "allowedToSendVoiceMessages" | "allowedToSendVideos";

export class MessagePermissions {
    constructor(private readonly entities: EntitiesStore,
                private readonly authorization: AuthorizationStore,
                private readonly userChatRoles: UserChatRolesStore) {
        makeAutoObservable(this);
    }

    get currentUser(): CurrentUser | undefined {
        return this.authorization.currentUser;
    }

    canEditMessage = createTransformer((message: MessageEntity): boolean => {
        if (!this.currentUser) {
            return false;
        }

        if (message.messageDeleted) {
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

    canCreateMessage = computedFn((chatId: string): boolean => {
        if (!this.currentUser) {
            return false;
        }

        if (this.authorization.isCurrentUserBannedGlobally()) {
            return false;
        }

        return this.canCurrentUserSendMessages(chatId);
    });

    canSendStickers = computedFn((chatId: string): boolean => this.checkSendMessagesFeature(
        chatId,
        "allowedToSendStickers"
    ));

    canSendImages = computedFn((chatId: string): boolean => this.checkSendMessagesFeature(
        chatId,
        "allowedToSendImages"
    ));

    canSendFiles = computedFn((chatId: string): boolean => this.checkSendMessagesFeature(
        chatId,
        "allowedToSendFiles"
    ));

    canSendVoiceMessages = computedFn((chatId: string): boolean => this.checkSendMessagesFeature(
        chatId,
        "allowedToSendVoiceMessages"
    ));

    canSendVideos = computedFn((chatId: string): boolean => this.checkSendMessagesFeature(
        chatId,
        "allowedToSendVideos"
    ));

    canSendAudios = computedFn((chatId: string): boolean => this.checkSendMessagesFeature(
        chatId,
        "allowedToSendAudios"
    ));

    private checkSendMessagesFeature = computedFn((chatId: string, feature: SendMessagesPermission): boolean => {
        if (!this.currentUser || this.authorization.isCurrentUserBannedGlobally()) {
            return false;
        }

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

        if (message.messageDeleted) {
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

    canUnpinMessage = computedFn((chatId: string): boolean => this.canPinMessage(chatId));

    canPinMessage = computedFn((chatId: string): boolean => {
        if (!this.currentUser) {
            return false;
        }

        if (!this.isCurrentUserParticipantOfChat(chatId)) {
            return false;
        }

        const chatRole = this.getRoleOfCurrentUserInChat(chatId);

        return chatRole.features.pinMessages.enabled;
    });

    canReadScheduledMessages = computedFn((chatId: string): boolean => this.canScheduleMessage(chatId));

    canScheduleMessage = computedFn((chatId: string): boolean => {
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

        return isDefined(chatRole) && chatRole.features.scheduleMessages.enabled;
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

    private canCurrentUserSendMessages = computedFn((chatId: string) => {
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