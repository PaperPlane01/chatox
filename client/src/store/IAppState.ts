import {EntitiesStore} from "../entities-store";
import {LocaleStore} from "../localization";
import {AppBarStore} from "../AppBar";
import {AuthorizationStore, LoginStore} from "../Authorization";
import {UserRegistrationStore} from "../Registration";
import {
    ChatsOfCurrentUserStore,
    CreateChatStore,
    ChatStore,
    ChatParticipantsStore,
    JoinChatStore
} from "../Chat";
import {MarkdownPreviewDialogStore} from "../Markdown";
import {CreateMessageStore, MessagesOfChatStore} from "../Message";
import {WebsocketStore} from "../websocket";
import {UserProfileStore} from "../User";

export interface IAppState {
    language: LocaleStore,
    authorization: AuthorizationStore,
    userRegistration: UserRegistrationStore,
    login: LoginStore,
    appBar: AppBarStore,
    chatCreation: CreateChatStore,
    markdownPreviewDialog: MarkdownPreviewDialogStore,
    entities: EntitiesStore,
    chatsOfCurrentUser: ChatsOfCurrentUserStore,
    chat: ChatStore,
    chatParticipants: ChatParticipantsStore,
    messageCreation: CreateMessageStore,
    messagesOfChat: MessagesOfChatStore,
    joinChat: JoinChatStore,
    websocket: WebsocketStore,
    userProfile: UserProfileStore,
    store?: any
}
