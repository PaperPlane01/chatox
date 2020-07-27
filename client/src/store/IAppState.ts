import {EntitiesStore} from "../entities-store";
import {LocaleStore} from "../localization";
import {AppBarStore} from "../AppBar";
import {AuthorizationStore, LoginStore} from "../Authorization";
import {
    UserRegistrationStore,
    SendVerificationEmailStore,
    CheckEmailVerificationCodeStore,
    RegistrationDialogStore
} from "../Registration";
import {
    ChatInfoDialogStore,
    ChatParticipantsStore,
    ChatsOfCurrentUserStore,
    ChatStore,
    CreateChatStore,
    JoinChatStore,
    OnlineChatParticipantsStore,
    UploadChatAvatarStore,
    UpdateChatStore
} from "../Chat";
import {MarkdownPreviewDialogStore} from "../Markdown";
import {CreateMessageStore, MessagesOfChatStore, MessageDialogStore} from "../Message";
import {WebsocketStore} from "../websocket";
import {UserProfileStore} from "../User";
import {
    BlockUserInChatByIdOrSlugStore,
    CancelChatBlockingStore,
    ChatBlockingInfoDialogStore,
    ChatBlockingsDialogStore,
    ChatBlockingsOfChatStore,
    CreateChatBlockingStore,
    UpdateChatBlockingStore
} from "../ChatBlocking";

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
    createChatBlocking: CreateChatBlockingStore,
    chatBlockingsOfChat: ChatBlockingsOfChatStore,
    chatBlockingsDialog: ChatBlockingsDialogStore,
    cancelChatBlocking: CancelChatBlockingStore,
    chatBlockingInfoDialog: ChatBlockingInfoDialogStore,
    updateChatBlocking: UpdateChatBlockingStore,
    chatInfoDialog: ChatInfoDialogStore,
    blockUserInChatByIdOrSlug: BlockUserInChatByIdOrSlugStore,
    onlineChatParticipants: OnlineChatParticipantsStore,
    chatAvatarUpload: UploadChatAvatarStore,
    chatUpdate: UpdateChatStore,
    sendVerificationEmail: SendVerificationEmailStore,
    verificationCodeCheck: CheckEmailVerificationCodeStore,
    registrationDialog: RegistrationDialogStore,
    messageDialog: MessageDialogStore,
    store?: any
}
