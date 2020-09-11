import {EntitiesStore} from "../entities-store";
import {LocaleStore} from "../localization";
import {AppBarStore} from "../AppBar";
import {AuthorizationStore, LoginStore} from "../Authorization";
import {RegistrationDialogStore, SendConfirmationCodeStore, UserRegistrationStore} from "../Registration";
import {
    ChatInfoDialogStore,
    ChatParticipantsStore,
    ChatsOfCurrentUserStore, ChatsPreferencesStore,
    ChatStore,
    CreateChatStore,
    JoinChatStore,
    OnlineChatParticipantsStore,
    UpdateChatStore
} from "../Chat";
import {MarkdownPreviewDialogStore} from "../Markdown";
import {CreateMessageStore, MessageDialogStore, MessagesOfChatStore, UpdateMessageStore, UploadMessageAttachmentsStore} from "../Message";
import {WebsocketStore} from "../websocket";
import {
    EditProfileStore,
    PasswordChangeFormSubmissionStore,
    PasswordChangeStepStore,
    PasswordChangeStore,
    SendPasswordChangeEmailConfirmationCodeStore,
    UserProfileStore
} from "../User";
import {
    BlockUserInChatByIdOrSlugStore,
    CancelChatBlockingStore,
    ChatBlockingInfoDialogStore,
    ChatBlockingsDialogStore,
    ChatBlockingsOfChatStore,
    CreateChatBlockingStore,
    UpdateChatBlockingStore
} from "../ChatBlocking";
import {UploadImageStore} from "../Upload";
import {SettingsTabsStore} from "../Settings/stores";
import {CheckEmailConfirmationCodeStore} from "../EmailConfirmation";
import {EmojiSettingsStore} from "../Emoji/stores";
import {AudioPlayerStore} from "../AudioPlayer/stores";

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
    chatAvatarUpload: UploadImageStore,
    chatUpdate: UpdateChatStore,
    sendVerificationEmail: SendConfirmationCodeStore,
    registrationEmailConfirmationCodeCheck: CheckEmailConfirmationCodeStore,
    registrationDialog: RegistrationDialogStore,
    messageDialog: MessageDialogStore,
    userAvatarUpload: UploadImageStore,
    editProfile: EditProfileStore,
    settingsTabs: SettingsTabsStore,
    messageUpdate: UpdateMessageStore,
    passwordChangeEmailConfirmationCodeCheck: CheckEmailConfirmationCodeStore,
    passwordChange: PasswordChangeStore,
    passwordChangeForm: PasswordChangeFormSubmissionStore,
    passwordChangeStep: PasswordChangeStepStore,
    passwordChangeEmailConfirmationCodeSending: SendPasswordChangeEmailConfirmationCodeStore,
    emoji: EmojiSettingsStore,
    chatsPreferences: ChatsPreferencesStore,
    messageUploads: UploadMessageAttachmentsStore,
    audioPlayer: AudioPlayerStore,
    store?: any
}
