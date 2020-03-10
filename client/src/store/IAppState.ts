import {EntitiesStore} from "../entities-store";
import {LocaleStore} from "../localization";
import {AppBarStore} from "../AppBar";
import {AuthorizationStore, LoginStore} from "../Authorization";
import {UserRegistrationStore} from "../Registration";
import {ChatsOfCurrentUserStore, CreateChatStore, ChatStore, ChatParticipationsStore} from "../Chat";
import {MarkdownPreviewDialogStore} from "../Markdown";

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
    chatParticipations: ChatParticipationsStore,
    store?: any
}
