import {EntitiesStore} from "../entities-store";
import {LocaleStore} from "../localization";
import {AppBarStore} from "../AppBar";
import {AuthorizationStore, LoginStore, LoginWithGoogleStore} from "../Authorization";
import {
    AnonymousRegistrationDialogStore,
    RegistrationDialogStore,
    SendConfirmationCodeStore,
    UserRegistrationStore
} from "../Registration";
import {
    ChatInfoDialogStore,
    ChatParticipantsStore,
    ChatsOfCurrentUserStore,
    ChatsPreferencesStore,
    ChatStore,
    CreateChatStore,
    DeleteChatStore,
    JoinChatStore,
    KickChatParticipantStore,
    LeaveChatStore,
    OnlineChatParticipantsStore,
    PopularChatsStore,
    UpdateChatParticipantStore,
    UpdateChatStore
} from "../Chat";
import {MarkdownPreviewDialogStore} from "../Markdown";
import {
    ClosedPinnedMessagesStore,
    CreateMessageStore,
    DeleteScheduledMessageStore,
    DownloadMessageFileStore,
    MessageDialogStore,
    MessagesListScrollPositionsStore,
    MessagesOfChatStore,
    PinMessageStore,
    PinnedMessagesStore,
    PublishScheduledMessageStore,
    ScheduledMessagesOfChatStore,
    ScheduleMessageStore,
    UnpinMessageStore,
    UpdateMessageStore,
    UpdateScheduledMessageStore,
    UploadMessageAttachmentsStore
} from "../Message";
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
import {
    PasswordRecoveryDialogStore,
    RecoverPasswordStore,
    SendPasswordRecoveryEmailConfirmationCodeStore
} from "../PasswordRecovery";
import {DeleteMessageStore} from "../Message/stores/DeleteMessageStore";
import {
    BanUserStore,
    CancelGlobalBanStore,
    GlobalBanDetailsDialogStore,
    GlobalBansListStore,
    UpdateGlobalBanStore
} from "../GlobalBan/stores";
import {
    BanUsersRelatedToSelectedReportsStore,
    CreateReportStore,
    CurrentReportsListStore,
    DeclineSelectedReportsStore,
    ReportedMessageDialogStore,
    ReportsListStore,
    UpdateSelectedReportsStore
} from "../Report/stores";
import {DeleteSelectedReportedMessagesStore} from "../Report/stores/DeleteSelectedReportedMessagesStore";

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
    messageFileDownload: DownloadMessageFileStore,
    passwordRecoveryDialog: PasswordRecoveryDialogStore,
    passwordRecoveryForm: RecoverPasswordStore,
    passwordRecoveryEmailConfirmationCodeSending: SendPasswordRecoveryEmailConfirmationCodeStore,
    passwordRecoveryEmailConfirmationCodeCheck: CheckEmailConfirmationCodeStore,
    leaveChat: LeaveChatStore,
    popularChats: PopularChatsStore,
    messageDeletion: DeleteMessageStore,
    anonymousRegistration: AnonymousRegistrationDialogStore,
    kickFromChat: KickChatParticipantStore,
    chatDeletion: DeleteChatStore,
    userGlobalBan: BanUserStore,
    globalBansList: GlobalBansListStore,
    globalBanDetailsDialog: GlobalBanDetailsDialogStore,
    cancelGlobalBan: CancelGlobalBanStore,
    updateGlobalBan: UpdateGlobalBanStore,
    updateChatParticipant: UpdateChatParticipantStore,
    pinnedMessages: PinnedMessagesStore,
    pinMessage: PinMessageStore,
    unpinMessage: UnpinMessageStore,
    closedPinnedMessages: ClosedPinnedMessagesStore,
    scheduleMessage: ScheduleMessageStore,
    scheduledMessagesOfChat: ScheduledMessagesOfChatStore,
    publishScheduledMessage: PublishScheduledMessageStore,
    deleteScheduledMessage: DeleteScheduledMessageStore,
    updateScheduledMessage: UpdateScheduledMessageStore,
    reportMessage: CreateReportStore,
    messageReports: ReportsListStore,
    reportedMessageDialog: ReportedMessageDialogStore,
    selectedReportsUpdate: UpdateSelectedReportsStore,
    selectedReportedMessagesDeletion: DeleteSelectedReportedMessagesStore,
    selectedReportedMessagesSendersBan: BanUsersRelatedToSelectedReportsStore,
    declineReports: DeclineSelectedReportsStore,
    currentReportsList: CurrentReportsListStore,
    reportUser: CreateReportStore,
    userReports: ReportsListStore,
    selectedReportedUsersBan: BanUsersRelatedToSelectedReportsStore,
    reportChat: CreateReportStore,
    chatReports: ReportsListStore,
    selectedReportedChatsCreatorsBan: BanUsersRelatedToSelectedReportsStore,
    googleLogin: LoginWithGoogleStore,
    messagesListScrollPositions: MessagesListScrollPositionsStore,
    store?: any
}
