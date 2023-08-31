import {EntitiesStore, RawEntitiesStore} from "../entities-store";
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
    ChatsOfCurrentUserStore,
    ChatsPreferencesStore,
    ChatStore,
    CreateChatStore,
    DeleteChatStore,
    LeaveChatStore,
    PopularChatsStore,
    UpdateChatStore
} from "../Chat";
import {
    ChatParticipantsSearchStore,
    ChatParticipantsStore,
    JoinChatStore,
    KickChatParticipantStore,
    OnlineChatParticipantsStore,
    UpdateChatParticipantStore,
} from "../ChatParticipant";
import {MarkdownPreviewDialogStore} from "../Markdown";
import {
    ClosedPinnedMessagesStore,
    CreateMessageStore,
    DeleteScheduledMessageStore,
    DownloadMessageFileStore,
    EmojiPickerTabsStore,
    MarkMessageReadStore,
    MessageDialogStore,
    MessagesListScrollPositionsStore,
    MessagesOfChatStore,
    PinMessageStore,
    PinnedMessagesStore,
    PublishScheduledMessageStore,
    ScheduledMessagesOfChatStore,
    ScheduleMessageStore,
    SearchMessagesStore,
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
import {
    CreateStickerPackStore,
    InstalledStickerPacksStore,
    InstallStickerPackStore,
    SearchStickerPacksStore,
    StickerEmojiPickerDialogStore,
    StickerPackDialogStore,
    StickerPickerStore,
    UninstallStickerPackStore
} from "../Sticker";
import {AddUserToBlacklistStore, BlacklistedUsersStore, RemoveUserFromBlacklistStore} from "../Blacklist";
import {
    AllChatsMessagesSearchStore,
    ChatsAndMessagesSearchQueryStore,
    ChatsOfCurrentUserSearchStore
} from "../ChatsAndMessagesSearch";
import {
    ChatFeaturesFormStore,
    ChatRoleInfoDialogStore,
    CreateChatRoleStore,
    EditChatRoleStore,
    RolesOfChatStore,
    UserChatRolesStore
} from "../ChatRole";
import {
    SendEmailChangeConfirmationCodeStore,
    SendNewEmailConfirmationCodeStore,
    UpdateEmailDialogStore,
    UpdateEmailStore
} from "../EmailUpdate";
import {ThemeStore} from "../Theme";
import {
    ClaimableRewardsStore,
    CreateRewardStore,
    RewardClaimStore,
    RewardDetailsDialogStore,
    RewardDetailsStore,
    RewardsListStore,
    SelectUserForRewardStore,
    UpdateRewardStore
} from "../Reward";
import {BalanceStore} from "../Balance";

export interface IAppState {
    language: LocaleStore,
    authorization: AuthorizationStore,
    userRegistration: UserRegistrationStore,
    login: LoginStore,
    appBar: AppBarStore,
    chatCreation: CreateChatStore,
    markdownPreviewDialog: MarkdownPreviewDialogStore,
    entities: EntitiesStore,
    rawEntities: RawEntitiesStore,
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
    markMessageRead: MarkMessageReadStore,
    stickerPackCreation: CreateStickerPackStore,
    stickerEmojiPickerDialog: StickerEmojiPickerDialogStore,
    installedStickerPacks: InstalledStickerPacksStore,
    stickerPackInstallation: InstallStickerPackStore,
    stickerPackUninstallation: UninstallStickerPackStore,
    stickerPacksSearch: SearchStickerPacksStore,
    stickerPackDialog: StickerPackDialogStore,
    stickerPicker: StickerPickerStore,
    emojiPickerTabs: EmojiPickerTabsStore,
    blacklistedUsers: BlacklistedUsersStore,
    addUserToBlacklist: AddUserToBlacklistStore,
    removeUserFromBlacklist: RemoveUserFromBlacklistStore,
    messagesSearch: SearchMessagesStore,
    chatsAndMessagesSearchQuery: ChatsAndMessagesSearchQueryStore,
    allChatsMessagesSearch: AllChatsMessagesSearchStore,
    chatsOfCurrentUserSearch: ChatsOfCurrentUserSearchStore,
    rolesOfChats: RolesOfChatStore,
    userChatRoles: UserChatRolesStore,
    chatFeaturesForm: ChatFeaturesFormStore,
    chatRoleInfo: ChatRoleInfoDialogStore,
    editChatRole: EditChatRoleStore,
    createChatRole: CreateChatRoleStore,
    chatParticipantsSearch: ChatParticipantsSearchStore,
    updateEmailDialog: UpdateEmailDialogStore,
    emailChangeConfirmationCode: SendEmailChangeConfirmationCodeStore,
    emailChangeConfirmationCodeCheck: CheckEmailConfirmationCodeStore,
    newEmailConfirmationCode: SendNewEmailConfirmationCodeStore,
    newEmailConfirmationCodeCheck: CheckEmailConfirmationCodeStore,
    emailUpdate: UpdateEmailStore,
    theme: ThemeStore,
    rewardCreation: CreateRewardStore,
    rewardCreationUserSelect: SelectUserForRewardStore,
    rewardUpdate: UpdateRewardStore,
    rewardUpdateUserSelect: SelectUserForRewardStore,
    rewardsList: RewardsListStore,
    rewardDetails: RewardDetailsStore,
    rewardDetailsDialog: RewardDetailsDialogStore,
    claimableRewards: ClaimableRewardsStore,
    rewardClaim: RewardClaimStore,
    balance: BalanceStore
}
