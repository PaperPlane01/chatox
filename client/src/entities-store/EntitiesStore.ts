import {action, computed, toJS} from "mobx";
import {ChatParticipationEntity, ChatParticipationsStore, ChatsStore, ChatUploadsStore} from "../Chat";
import {UsersStore} from "../User";
import {
    ChatBlocking,
    ChatDeletionReason,
    ChatOfCurrentUser,
    ChatParticipation,
    ChatRole, ChatWithCreatorId,
    CurrentUser,
    GlobalBan,
    Message,
    Report, ReportType,
    User
} from "../api/types/response";
import {MessagesStore, ScheduledMessagesStore} from "../Message";
import {AuthorizationStore} from "../Authorization";
import {ChatBlockingsStore} from "../ChatBlocking/stores";
import {UploadsStore} from "../Upload/stores";
import {ChatUpdated} from "../api/types/websocket";
import {PartialBy} from "../utils/types";
import {GlobalBansStore} from "../GlobalBan/stores";
import {ReportedChatsStore, ReportsStore} from "../Report/stores";

type DecreaseChatParticipantsCountCallback = (chatParticipation?: ChatParticipationEntity, currentUser?: CurrentUser) => boolean;

export class EntitiesStore {
    private authorizationStore: AuthorizationStore;

    setAuthorizationStore = (authorizationStore: AuthorizationStore): void => {
        this.authorizationStore = authorizationStore;
    };

    @computed
    get currentUser(): CurrentUser | undefined {
        return this.authorizationStore.currentUser;
    }

    constructor(
        public messages: MessagesStore,
        public chats: ChatsStore,
        public users: UsersStore,
        public chatParticipations: ChatParticipationsStore,
        public chatBlockings: ChatBlockingsStore,
        public uploads: UploadsStore,
        public chatUploads: ChatUploadsStore,
        public globalBans: GlobalBansStore,
        public scheduledMessages: ScheduledMessagesStore,
        public reports: ReportsStore,
        public reportedMessages: MessagesStore,
        public reportedMessagesSenders: UsersStore,
        public reportedUsers: UsersStore,
        public reportedChats: ReportedChatsStore
    ) {
    }

    @action
    insertMessages = (messages: Message[], skipSettingLastMessage: boolean = false): void => {
        messages.reverse().forEach((message, index, messagesArray) => {
            if (index !== 0 && !message.scheduledAt) {
                message.previousMessageId = messagesArray[index - 1].id;
            }

            if (index !== messages.length - 1 && !message.scheduledAt) {
                message.nextMessageId = messagesArray[index + 1].id;
            }

            this.insertMessage(message, skipSettingLastMessage);
        });
    }

    @action
    insertMessage = (message: Message, skipSettingLastMessage: boolean = false): void => {
        this.insertUser(message.sender);

        if (message.referredMessage) {
            this.insertMessage(message.referredMessage, skipSettingLastMessage);
        }

        this.uploads.insertAll(message.attachments);

        if (message.scheduledAt) {
            this.scheduledMessages.insert(message);
            this.chats.addScheduledMessageToChat(message.chatId, message.id);
        } else {
            this.messages.insert(message);
            this.chats.addMessageToChat(message.chatId, message.id, message.index, skipSettingLastMessage);
        }
    }

    @action
    updateChat = (chatUpdated: ChatUpdated): void => {
        const chat = this.chats.findByIdOptional(chatUpdated.id);

        if (chat) {
            if (chatUpdated.avatar) {
                this.uploads.insert(chatUpdated.avatar);
            }

            chat.name = chatUpdated.name;
            chat.slug = chatUpdated.slug;
            chat.avatarId = chatUpdated.avatar ? chatUpdated.avatar.id : undefined;
            chat.description = chatUpdated.description;

            this.chats.insertEntity(chat);
        }
    }

    @action
    insertChats = (chatsOfCurrentUser: PartialBy<ChatOfCurrentUser, "unreadMessagesCount" | "deleted">[]): void => {
        chatsOfCurrentUser.forEach(chat => this.insertChat({
            ...chat,
            deleted: chat.deleted === undefined ? false : chat.deleted
        }));
    }

    @action
    insertChat = (chat: PartialBy<ChatOfCurrentUser, "unreadMessagesCount">): void => {
        let unreadMessagesCount: number;

        if (chat.unreadMessagesCount === undefined || chat.unreadMessagesCount === null) {
            const existingChat = this.chats.findByIdOptional(chat.id);

            if (existingChat) {
                unreadMessagesCount = existingChat.unreadMessagesCount;
            } else {
                unreadMessagesCount = 0;
            }
        } else {
            unreadMessagesCount = chat.unreadMessagesCount;
        }

        const chatEntity = this.chats.insert({...chat, unreadMessagesCount});

        if (chat.lastMessage) {
            this.insertMessage(chat.lastMessage);
        }

        if (chat.lastReadMessage) {
            this.insertMessage(chat.lastReadMessage);
        }

        if (chat.avatar) {
            this.uploads.insert(chat.avatar);
        }

        if (this.currentUser && chat.chatParticipation) {
            if (chat.chatParticipation.activeChatBlocking) {
                this.chatBlockings.insert(chat.chatParticipation.activeChatBlocking);
            }

            this.chatParticipations.insert({
                ...chat.chatParticipation,
                user: {
                    ...this.currentUser,
                    deleted: false,
                    online: true
                },
                chatId: chat.id,
                activeChatBlocking: chat.chatParticipation.activeChatBlocking
            });

            chatEntity.participants = Array.from(new Set([
                ...chatEntity.participants,
                chat.chatParticipation.id
            ]))
        }
    }

    @action
    insertChatParticipations = (chatParticipations: ChatParticipation[]): void => {
        chatParticipations.forEach(chatParticipation => this.insertChatParticipation(chatParticipation));
    }

    @action
    insertChatParticipation = (chatParticipation: ChatParticipation, currentUser: boolean = false): void => {
        this.insertUser(chatParticipation.user);
        this.chatParticipations.insert(chatParticipation);
        const chat = this.chats.findByIdOptional(chatParticipation.chatId);
        if (chat && currentUser) {
            chat.currentUserParticipationId = chatParticipation.id;
            this.chats.increaseChatParticipantsCount(chat.id);
        }
    }

    @action
    deleteChatParticipation = (id: string, decreaseChatParticipantsCount: boolean | DecreaseChatParticipantsCountCallback = false, chatId?: string): void => {
        const chatParticipation = this.chatParticipations.findById(id);

        if (chatParticipation) {
            const chat = this.chats.findById(chatParticipation.chatId);

            if (chat.currentUserParticipationId === id) {
                chat.currentUserParticipationId = undefined;
            }

            this.chatParticipations.deleteById(id);

            if (typeof decreaseChatParticipantsCount === "function") {
                if (decreaseChatParticipantsCount(chatParticipation, this.authorizationStore.currentUser)) {
                    this.chats.decreaseChatParticipantsCount(chat.id);
                }
            } else if (decreaseChatParticipantsCount) {
                this.chats.decreaseChatParticipantsCount(chat.id);
            }
        } else if (chatId) {
            if (typeof decreaseChatParticipantsCount === "function") {
                if (decreaseChatParticipantsCount(undefined, this.currentUser)) {
                    this.chats.decreaseChatParticipantsCount(chatId);
                }
            } else if (decreaseChatParticipantsCount) {
                this.chats.decreaseChatParticipantsCount(chatId);
            }
        }
    }

    @action
    insertUsers = (users: User[], retrieveOnlineStatusFromExistingUser: boolean = false): void => {
        users.forEach(user => this.insertUser(user, retrieveOnlineStatusFromExistingUser));
    }

    @action
    insertUser = (user: User, retrieveOnlineStatusFromExistingUser: boolean = false): void => {
        if (user.avatar) {
            this.uploads.insert(user.avatar);
        }

        if (retrieveOnlineStatusFromExistingUser) {
            const existingUser = this.users.findByIdOptional(user.id);

            if (existingUser) {
                this.users.insert({
                    ...user,
                    online: existingUser.online,
                    lastSeen: existingUser.lastSeen ? existingUser.lastSeen.toISOString() : user.lastSeen
                });
            } else {
                this.users.insert({
                    ...user,
                    onlineStatusMightBeInaccurate: true
                });
            }
        } else {
            this.users.insert(user);
        }
    }

    @action
    insertChatBlockings = (chatBlockings: ChatBlocking[]): void => {
        chatBlockings.forEach(blocking => this.insertChatBlocking(blocking));
    }

    @action
    insertChatBlocking = (chatBlocking: ChatBlocking): void => {
        this.insertUser(chatBlocking.blockedUser);
        this.insertUser(chatBlocking.blockedBy);
        chatBlocking.canceledBy && this.insertUser(chatBlocking.canceledBy);
        chatBlocking.lastModifiedBy && this.insertUser(chatBlocking.lastModifiedBy);
        const chatBlockingEntity = this.chatBlockings.insert(chatBlocking);

        if (this.authorizationStore.currentUser && chatBlockingEntity.blockedUserId === this.authorizationStore.currentUser.id) {
            const chatParticipation = this.chatParticipations.findByUserAndChat({
                userId: this.authorizationStore.currentUser.id,
                chatId: chatBlockingEntity.chatId
            });
            if (chatParticipation && chatParticipation.role === ChatRole.USER) {
                chatParticipation.activeChatBlockingId = chatBlockingEntity.id;
                this.chatParticipations.insertEntity(chatParticipation);
            }
        }
    }

    @action
    deleteChat = (chatId: string, deletionReason?: ChatDeletionReason, deletionComment?: string): void => {
        this.chats.deleteById(chatId);
        this.chats.setDeletionReasonAndComment(
            chatId,
            deletionReason,
            deletionComment
        );
    }

    @action
    insertGlobalBans = (globalBans: GlobalBan[]): void => {
        globalBans.forEach(globalBan => this.insertGlobalBan(globalBan));
    }

    @action
    insertGlobalBan = (globalBan: GlobalBan): void => {
        this.insertUsers([
            globalBan.createdBy,
            globalBan.bannedUser,
            globalBan.canceledBy,
            globalBan.updatedBy
        ]
                .filter(user => Boolean(user)) as User[],
            true
        );
        this.globalBans.insert(globalBan);
    }

    @action
    deleteScheduledMessage = (chatId: string, messageId: string): void => {
        this.chats.removeScheduledMessageFromChat(chatId, messageId);
        this.scheduledMessages.deleteById(messageId);
    }

    @action
    insertReports = (reports: Array<Report<any>>): void => {
        reports.forEach(report => this.insertReport(report));
    }

    @action
    insertReport = (report: Report<any>): void => {
        switch (report.type) {
            case ReportType.MESSAGE:
                this.insertMessageReport(report);
                return;
            case ReportType.USER:
                this.insertUserReport(report);
                return;
            case ReportType.CHAT:
                this.insertChatReport(report);
                return;
            default:
                return;
        }
    }

    @action
    insertMessageReports = (reports: Array<Report<Message>>): void => {
        reports.forEach(report => this.insertMessageReport(report));
    }

    @action
    insertMessageReport = (report: Report<Message>): void => {
        this.insertReportedMessage(report.reportedObject);
        this.reports.insert(report);
    }

    @action
    insertReportedMessage = (message: Message): void => {
        if (message.referredMessage) {
            this.insertReportedMessage(message.referredMessage);
        }

        this.reportedMessagesSenders.insert(message.sender);
        this.uploads.insertAll(message.attachments);
        this.reportedMessages.insert(message);
    }

    @action
    insertUserReports = (reports: Array<Report<User>>): void => {
        reports.forEach(report => this.insertUserReport(report));
    }

    @action
    insertUserReport = (report: Report<User>): void => {
        this.insertReportedUser(report.reportedObject);
        this.reports.insert(report);
    }

    @action
    insertReportedUser = (user: User): void => {
        this.reportedUsers.insert(user);
    }

    @action
    insertChatReports = (reports: Array<Report<ChatWithCreatorId>>): void => {
        reports.forEach(report => this.insertChatReport(report));
    }

    @action
    insertChatReport = (report: Report<ChatWithCreatorId>): void => {
        this.insertReportedChat(report.reportedObject);
        this.reports.insert(report);
    }

    @action
    insertReportedChat = (reportedChat: ChatWithCreatorId): void => {
        if (reportedChat.avatar) {
            this.uploads.insert(reportedChat.avatar);
        }

        this.reportedChats.insert(reportedChat);
    }

    @action
    deleteAllReports = (reportType: ReportType): void => {
        this.reports.deleteAll();

        switch (reportType) {
            case ReportType.MESSAGE:
                this.reportedMessages.deleteAll();
                this.reportedMessagesSenders.deleteAll();
                return;
            case ReportType.USER:
                this.reportedUsers.deleteAll();
                return;
            case ReportType.CHAT:
                this.reportedChats.deleteAll();
                return;
            default:
                return;
        }
    }
}
