import {RawEntitiesStore} from "./RawEntitiesStore";
import {MessagesStore} from "../Message";
import {ChatsStore} from "../Chat";
import {UploadsStore} from "../Upload";
import {UsersStore} from "../User";
import {ChatRolesStore} from "../ChatRole";
import {ChatBlockingsStore} from "../ChatBlocking";
import {ChatParticipationsStore} from "../Chat";
import {AuthorizationStore} from "../Authorization";
import {StickersStore, StickerPacksStore} from "../Sticker";
import {ReportedChatsStore, ReportedMessagesStore, ReportsStore} from "../Report";
import {GlobalBansStore} from "../GlobalBan";

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

    constructor(rawEntities: RawEntitiesStore, authorization: AuthorizationStore) {
        this.messages = new MessagesStore(rawEntities, "messages", this);
        this.chats = new ChatsStore(rawEntities, this, authorization);
        this.uploads = new UploadsStore(rawEntities, "uploads", this);
        this.users = new UsersStore(rawEntities, "users", this);
        this.chatRoles = new ChatRolesStore(rawEntities, "chatRoles", this);
        this.chatBlockings = new ChatBlockingsStore(rawEntities, this, authorization);
        this.globalBans = new GlobalBansStore(rawEntities, "globalBans", this);
        this.chatParticipations = new ChatParticipationsStore(rawEntities, this, authorization);
        this.stickers = new StickersStore(rawEntities, "stickers", this);
        this.stickerPacks = new StickerPacksStore(rawEntities, "stickerPacks", this);
        this.scheduledMessages = new MessagesStore(rawEntities, "scheduledMessages", this);
        this.reportedUsers = new UsersStore(rawEntities, "reportedUsers", this);
        this.reportedMessages = new ReportedMessagesStore(rawEntities, "reportedMessages", this);
        this.reportedMessageSenders = new UsersStore(rawEntities, "reportedMessageSenders", this);
        this.reportedChats = new ReportedChatsStore(rawEntities, "reportedChats", this);
        this.reports = new ReportsStore(rawEntities, "reports", this);
    }
}