import {RawEntitiesStore} from "./RawEntitiesStore";
import {EntitiesAware} from "./EntitiesAware";
import {Entities, GetEntityType} from "./types";
import {MessagesStore} from "../Message/stores";
import {ChatsStore} from "../Chat/stores";
import {UploadsStore} from "../Upload/stores";
import {UserProfilePhotosStore, UsersStore} from "../User/stores";
import {ChatRolesStore, UserChatRolesStore} from "../ChatRole/stores";
import {ChatBlockingsStore} from "../ChatBlocking/stores";
import {ChatParticipationsStore, PendingChatParticipationsStore} from "../ChatParticipant/stores";
import {AuthorizationStore} from "../Authorization/stores";
import {StickersStore, StickerPacksStore} from "../Sticker/stores";
import {ReportedChatsStore, ReportedMessagesStore, ReportsStore} from "../Report/stores";
import {GlobalBansStore} from "../GlobalBan/stores";
import {RewardsStore, UserRewardsStore} from "../Reward/stores";
import {UserInteractionsStore} from "../UserInteraction/stores";
import {ChatInvitesStore} from "../ChatInvite/stores";
import {EntityStore} from "../entity-store";
import {MessageReactionsStore} from "../MessageReaction/stores";

type EntitiesStores = {
    [Entity in Entities]: Entity extends "chatUploads" | "stickerAnimationData"
        ? any
        : EntityStore<Entity, GetEntityType<Entity>, any, any>
}

export class EntitiesStore {
    public messages: MessagesStore;
    public chats: ChatsStore;
    public uploads: UploadsStore;
    public users: UsersStore;
    public chatRoles: ChatRolesStore;
    public chatBlockings: ChatBlockingsStore;
    public globalBans: GlobalBansStore;
    public chatParticipations: ChatParticipationsStore;
    public stickers: StickersStore;
    public stickerPacks: StickerPacksStore;
    public scheduledMessages: MessagesStore;
    public reportedUsers: UsersStore;
    public reportedMessages: ReportedMessagesStore;
    public reportedMessageSenders: UsersStore;
    public reportedChats: ReportedChatsStore;
    public reports: ReportsStore;
    public rewards: RewardsStore;
    public userRewards: UserRewardsStore;
    public userInteractions: UserInteractionsStore;
    public userProfilePhotos: UserProfilePhotosStore;
    public chatInvites: ChatInvitesStore;
    public pendingChatParticipations: PendingChatParticipationsStore;
    public draftMessages: MessagesStore;
    public messageReactions: MessageReactionsStore;

    get stores(): EntitiesStores {
        return {
            messages: this.messages,
            chats: this.chats,
            uploads: this.uploads,
            users: this.users,
            chatRoles: this.chatRoles,
            chatBlockings: this.chatBlockings,
            globalBans: this.globalBans,
            chatParticipations: this.chatParticipations,
            stickers: this.stickers,
            stickerPacks: this.stickerPacks,
            scheduledMessages: this.scheduledMessages,
            reportedMessages: this.reportedMessages,
            reportedMessageSenders: this.reportedMessageSenders,
            reportedChats: this.reportedChats,
            reportedUsers: this.reportedUsers,
            reports: this.reports,
            rewards: this.rewards,
            userRewards: this.userRewards,
            userInteractions: this.userInteractions,
            userProfilePhotos: this.userProfilePhotos,
            chatInvites: this.chatInvites,
            pendingChatParticipations: this.pendingChatParticipations,
            chatUploads: undefined,
            draftMessages: this.draftMessages,
            stickerAnimationData: undefined,
            messageReactions: this.messageReactions
        }
    }

    constructor(rawEntities: RawEntitiesStore, authorization: AuthorizationStore, userChatRoles: UserChatRolesStore) {
        this.messages = new MessagesStore(rawEntities, "messages", this, userChatRoles);
        this.chats = new ChatsStore(rawEntities, this, authorization);
        this.uploads = new UploadsStore(rawEntities, "uploads", this);
        this.users = new UsersStore(rawEntities, "users", this);
        this.chatRoles = new ChatRolesStore(rawEntities, "chatRoles", this);
        this.chatBlockings = new ChatBlockingsStore(rawEntities, this, authorization);
        this.globalBans = new GlobalBansStore(rawEntities, "globalBans", this);
        this.chatParticipations = new ChatParticipationsStore(rawEntities, this, authorization);
        this.stickers = new StickersStore(rawEntities, "stickers", this);
        this.stickerPacks = new StickerPacksStore(rawEntities, "stickerPacks", this);
        this.scheduledMessages = new MessagesStore(rawEntities, "scheduledMessages", this, userChatRoles);
        this.reportedUsers = new UsersStore(rawEntities, "reportedUsers", this);
        this.reportedMessages = new ReportedMessagesStore(rawEntities, "reportedMessages", this);
        this.reportedMessageSenders = new UsersStore(rawEntities, "reportedMessageSenders", this);
        this.reportedChats = new ReportedChatsStore(rawEntities, "reportedChats", this);
        this.reports = new ReportsStore(rawEntities, "reports", this);
        this.rewards = new RewardsStore(rawEntities, this);
        this.userRewards = new UserRewardsStore(rawEntities, "userRewards", this);
        this.userInteractions = new UserInteractionsStore(rawEntities, "userInteractions", this);
        this.userProfilePhotos = new UserProfilePhotosStore(rawEntities, "userProfilePhotos", this);
        this.chatInvites = new ChatInvitesStore(rawEntities, "chatInvites", this);
        this.pendingChatParticipations = new PendingChatParticipationsStore(rawEntities, "pendingChatParticipations", this);
        this.draftMessages = new MessagesStore(rawEntities, "draftMessages", this, userChatRoles);
        this.messageReactions = new MessageReactionsStore(rawEntities, this);
    }

    public setEntitiesStore(entitiesAwareStores: EntitiesAware[]): void {
        entitiesAwareStores.forEach(entitiesAware => entitiesAware.setEntities(this));
    }
}