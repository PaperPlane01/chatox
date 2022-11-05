import {RawEntitiesStore} from "./RawEntitiesStore";
import {MessagesStoreV2} from "../Message";
import {ChatsStoreV2} from "../Chat";
import {UploadsStoreV2} from "../Upload";
import {UsersStoreV2} from "../User";
import {ChatRolesStoreV2} from "../ChatRole";
import {ChatBlockingsStoreV2} from "../ChatBlocking";
import {ChatParticipationsStoreV2} from "../Chat";
import {AuthorizationStore} from "../Authorization";
import {StickersStoreV2, StickerPacksStoreV2} from "../Sticker";

export class EntitiesStoreV2 {
    public messages: MessagesStoreV2<"messages">;
    public chats: ChatsStoreV2;
    public uploads: UploadsStoreV2;
    public users: UsersStoreV2;
    public chatRoles: ChatRolesStoreV2;
    public chatBlockings: ChatBlockingsStoreV2;
    public chatParticipations: ChatParticipationsStoreV2;
    public stickers: StickersStoreV2;
    public stickerPacks: StickerPacksStoreV2;

    constructor(rawEntities: RawEntitiesStore, authorization: AuthorizationStore) {
        this.messages = new MessagesStoreV2(rawEntities, "messages", this);
        this.chats = new ChatsStoreV2(rawEntities, this, authorization);
        this.uploads = new UploadsStoreV2(rawEntities, "uploads", this);
        this.users = new UsersStoreV2(rawEntities, "users", this);
        this.chatRoles = new ChatRolesStoreV2(rawEntities, "chatRoles", this);
        this.chatBlockings = new ChatBlockingsStoreV2(rawEntities,  this, authorization);
        this.chatParticipations = new ChatParticipationsStoreV2(rawEntities, this, authorization);
        this.stickers = new StickersStoreV2(rawEntities, "stickers", this);
        this.stickerPacks = new StickerPacksStoreV2(rawEntities, "stickerPacks", this);
    }
}