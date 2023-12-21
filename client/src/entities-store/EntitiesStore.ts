import {RawEntitiesStore} from "./RawEntitiesStore";
import {EntitiesAware} from "./EntitiesAware";
import {MessagesStore} from "../Message";
import {ChatsStore} from "../Chat";
import {UploadsStore} from "../Upload";
import {UserProfilePhotosStore, UsersStore} from "../User";
import {ChatRolesStore, UserChatRolesStore} from "../ChatRole";
import {ChatBlockingsStore} from "../ChatBlocking";
import {ChatParticipationsStore} from "../ChatParticipant";
import {AuthorizationStore} from "../Authorization";
import {StickersStore, StickerPacksStore} from "../Sticker";
import {ReportedChatsStore, ReportedMessagesStore, ReportsStore} from "../Report";
import {GlobalBansStore} from "../GlobalBan";
import {RewardsStore, UserRewardsStore} from "../Reward";
import {UserInteractionsStore} from "../UserInteraction";
import {ChatInvitesStore} from "../ChatInvite";

export class EntitiesStore {
    public messages: MessagesStore<"messages">;
    public chats: ChatsStore;
    public uploads: UploadsStore;
    public users: UsersStore<"users">;
    public chatRoles: ChatRolesStore;
    public chatBlockings: ChatBlockingsStore;
    public globalBans: GlobalBansStore;
    public chatParticipations: ChatParticipationsStore;
    public stickers: StickersStore;
    public stickerPacks: StickerPacksStore;
    public scheduledMessages: MessagesStore<"scheduledMessages">;
    public reportedUsers: UsersStore<"reportedUsers">;
    public reportedMessages: ReportedMessagesStore;
    public reportedMessageSenders: UsersStore<"reportedMessageSenders">;
    public reportedChats: ReportedChatsStore;
    public reports: ReportsStore;
    public rewards: RewardsStore;
    public userRewards: UserRewardsStore;
    public userInteractions: UserInteractionsStore;
    public userProfilePhotos: UserProfilePhotosStore;
    public chatInvites: ChatInvitesStore;

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
    }

    public setEntitiesStore(entitiesAwareStores: EntitiesAware[]): void {
        entitiesAwareStores.forEach(entitiesAware => entitiesAware.setEntities(this));
    }
}