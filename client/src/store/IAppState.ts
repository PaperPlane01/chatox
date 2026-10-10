import type {AppBarStore} from "../AppBar/stores";
import type {AuthorizationStore, LoginStore, LoginWithGoogleStore} from "../Authorization/stores";
import {
    PasswordRecoveryDialogStore,
    RecoverPasswordStore,
    SendPasswordRecoveryEmailConfirmationCodeStore
} from "../PasswordRecovery/stores";
import type {
    AnonymousRegistrationDialogStore,
    RegistrationDialogStore,
    SendConfirmationCodeStore,
    UserRegistrationStore
} from "../Registration/stores";
import type {
    ChatInfoDialogStore,
    ChatsOfCurrentUserStore,
    ChatsPreferencesStore,
    ChatStore,
    CreateChatStore,
    DeleteChatStore,
    LeaveChatStore,
    PendingChatsOfCurrentUserStore,
    PopularChatsStore,
    TransferChatOwnershipStore,
    TypingUsersStore,
    UpdateChatStore
} from "../Chat/stores";
import type {
    ApproveJoinChatRequestsStore,
    ChatParticipantsAutoCompleteStore,
    ChatParticipantsSearchStore,
    ChatParticipantsStore,
    JoinChatRequestsStore,
    JoinChatStore,
    KickChatParticipantStore,
    OnlineChatParticipantsStore,
    RejectJoinChatRequestsStore,
    UpdateChatParticipantStore
} from "../ChatParticipant/stores";
import type {MarkdownPreviewDialogStore} from "../Markdown/stores";
import type {LocaleStore} from "../localization";
import type {EntitiesStore, RawEntitiesStore, ReferencedEntitiesStore} from "../entities-store";
import type {
    CreateUserProfilePhotoStore,
    DeleteSelectedUserProfilePhotosStore,
    DeleteUserProfilePhotoStore,
    EditProfileStore,
    PasswordChangeFormSubmissionStore,
    PasswordChangeStepStore,
    PasswordChangeStore,
    SelectedUserProfilePhotosStore,
    SendPasswordChangeEmailConfirmationCodeStore,
    SetPhotoAsAvatarStore,
    UserProfilePhotosGalleryStore,
    UserProfileStore
} from "../User/stores";
import type {
    ClosedPinnedMessagesStore,
    DeleteMessageStore,
    DeleteScheduledMessageStore,
    DownloadMessageFileStore,
    ForwardMessagesStore,
    MarkMessageReadStore,
    MessageDialogStore,
    MessagesListScrollPositionsStore,
    MessagesOfChatStore,
    PinMessageStore,
    PinnedMessagesStore,
    PublishScheduledMessageStore,
    ScheduledMessagesOfChatStore,
    SearchMessagesStore,
    UnpinMessageStore
} from "../Message/stores";
import type {
    CreateMessageStore,
    EmojiPickerTabsStore,
    RecordVoiceMessageStore,
    ScheduleMessageStore,
    StickerSuggestionsStore,
    UpdateMessageStore,
    UpdateScheduledMessageStore,
    UploadMessageAttachmentsStore
} from "../MessageForm/stores";
import type {WebsocketStore} from "../websocket";
import type {
    BlockUserInChatByIdOrSlugStore,
    CancelChatBlockingStore,
    ChatBlockingInfoDialogStore,
    ChatBlockingsDialogStore,
    ChatBlockingsOfChatStore,
    CreateChatBlockingStore,
    UpdateChatBlockingStore
} from "../ChatBlocking/stores";
import type {UploadImageStore} from "../Upload/stores";
import {SettingsTabsStore} from "../Settings/stores";
import type {CheckEmailConfirmationCodeStore} from "../EmailConfirmation/stores";
import type {EmojiSettingsStore} from "../Emoji/stores";
import type {AudioPlayerStore} from "../AudioPlayer/stores";
import type {
    BanUserStore,
    CancelGlobalBanStore,
    GlobalBanDetailsDialogStore,
    GlobalBansListStore,
    UpdateGlobalBanStore
} from "../GlobalBan/stores";
import type {
    BanUsersRelatedToSelectedReportsStore,
    CreateReportStore,
    CurrentReportsListStore,
    DeclineSelectedReportsStore,
    DeleteSelectedReportedMessagesStore,
    ReportedMessageDialogStore,
    ReportsListStore,
    UpdateSelectedReportsStore
} from "../Report/stores";
import type {
    DeleteStickerPackStore,
    InstalledStickerPacksStore,
    InstallStickerPackStore,
    SearchStickerPacksStore,
    StickerAnimationDataStore,
    StickerPackDialogStore,
    StickerPackStore,
    StickerPickerStore,
    StickerPreviewDialogStore,
    StickersPreferencesStore,
    UninstallStickerPackStore
} from "../Sticker/stores";
import type {
    CreateStickerPackStore,
    ImportStickerPackStore,
    StickerEmojiPickerDialogStore,
    UpdateStickerPackStore
} from "../StickerPackForm/stores";
import type {AddUserToBlacklistStore, BlacklistedUsersStore, RemoveUserFromBlacklistStore} from "../Blacklist/stores";
import type {
    AllChatsMessagesSearchStore,
    ChatsAndMessagesSearchQueryStore,
    ChatsOfCurrentUserSearchStore
} from "../ChatsAndMessagesSearch/stores";
import type {
    ChatFeaturesFormStore,
    ChatRoleInfoDialogStore,
    CreateChatRoleStore,
    EditChatRoleStore,
    RolesOfChatStore,
    UserChatRolesStore
} from "../ChatRole/stores";
import type {
    SendEmailChangeConfirmationCodeStore,
    SendNewEmailConfirmationCodeStore,
    UpdateEmailDialogStore,
    UpdateEmailStore
} from "../EmailUpdate/stores";
import type {ThemeStore} from "../Theme/stores";
import type {
    ClaimableRewardsStore,
    CreateRewardStore,
    RewardClaimStore,
    RewardDetailsDialogStore,
    RewardDetailsStore,
    RewardsListStore,
    UpdateRewardStore
} from "../Reward/stores";
import type {BalanceStore} from "../Balance/stores";
import type {
    CreateUserInteractionStore,
    UserInteractionCostsStore,
    UserInteractionsCountStore,
    UserInteractionsHistoryStore
} from "../UserInteraction/stores";
import type {ChatManagementTabStore} from "../ChatManagement/store";
import type {SelectUserStore} from "../UserSelect/stores";
import type {
    ChatInviteDialogStore,
    ChatInviteInfoStore,
    ChatInviteListStore,
    CreateChatInviteStore,
    JoinChatByInviteStore,
    UpdateChatInviteStore
} from "../ChatInvite/stores";
import type {CreateEditorLinkDialogStore, MentionsStore} from "../TextEditor/stores";
import type {
    ChatNotificationExceptionsDialogStore,
    DeleteChatNotificationSettingsStore,
    NotificationSoundSelectDialogStore,
    NotificationsSettingsStore,
    SoundNotificationStore,
    UpdateChatNotificationsSettingsStore,
    UpdateGlobalNotificationsSettingsStore,
    UpdateUserNotificationSettingsInChatDialogStore,
    UserNotificationExceptionsDialogStore
} from "../Notification/stores";
import type {ConfirmationTokenStore, CreateConfirmationTokenStore} from "../ConfirmationToken/stores";
import type {
    MessageReactionOperationsStore,
    MessageReactionPickerStore,
    MessageReactionsDialogStore,
    ReactionsToMessagesStore
} from "../MessageReaction/stores";

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
    rewardCreationUserSelect: SelectUserStore,
    rewardUpdate: UpdateRewardStore,
    rewardUpdateUserSelect: SelectUserStore,
    rewardsList: RewardsListStore,
    rewardDetails: RewardDetailsStore,
    rewardDetailsDialog: RewardDetailsDialogStore,
    claimableRewards: ClaimableRewardsStore,
    rewardClaim: RewardClaimStore,
    balance: BalanceStore,
    userInteractionsCount: UserInteractionsCountStore,
    userInteractionCosts: UserInteractionCostsStore,
    userInteractionCreation: CreateUserInteractionStore,
    userInteractionsHistory: UserInteractionsHistoryStore,
    userProfilePhotosGallery: UserProfilePhotosGalleryStore,
    userProfilePhotoCreation: CreateUserProfilePhotoStore,
    selectedUserPhotos: SelectedUserProfilePhotosStore,
    deleteSelectedUserPhotos: DeleteSelectedUserProfilePhotosStore,
    setPhotoAsAvatar: SetPhotoAsAvatarStore,
    deleteUserPhoto: DeleteUserProfilePhotoStore,
    typingUsers: TypingUsersStore,
    messagesForwarding: ForwardMessagesStore,
    chatManagement: ChatManagementTabStore,
    pendingChats: PendingChatsOfCurrentUserStore,
    chatInviteCreation: CreateChatInviteStore,
    chatInviteCreationUserSelect: SelectUserStore,
    chatInviteUpdate: UpdateChatInviteStore,
    chatInviteUpdateUserSelect: SelectUserStore,
    chatInviteList: ChatInviteListStore,
    chatInviteDialog: ChatInviteDialogStore,
    chatInvite: ChatInviteInfoStore,
    joinChatByInvite: JoinChatByInviteStore,
    joinChatRequests: JoinChatRequestsStore,
    joinChatRequestsApproval: ApproveJoinChatRequestsStore,
    joinChatRequestsRejection: RejectJoinChatRequestsStore,
    voiceRecording: RecordVoiceMessageStore,
    mentions: MentionsStore,
    editorLink: CreateEditorLinkDialogStore,
    referencedEntities: ReferencedEntitiesStore,
    notificationsSettings: NotificationsSettingsStore,
    soundNotification: SoundNotificationStore,
    notificationSoundSelectDialog: NotificationSoundSelectDialogStore,
    updateGlobalNotificationsSettings: UpdateGlobalNotificationsSettingsStore,
    updateChatNotificationsSettings: UpdateChatNotificationsSettingsStore,
    chatNotificationExceptionsDialog: ChatNotificationExceptionsDialogStore,
    deleteChatNotificationsSettings: DeleteChatNotificationSettingsStore,
    chatParticipantsAutoComplete: ChatParticipantsAutoCompleteStore,
    userNotificationExceptionsDialog: UserNotificationExceptionsDialogStore,
    updateUserNotificationsSettingsInChatDialog: UpdateUserNotificationSettingsInChatDialogStore,
    stickerPackUpdate: UpdateStickerPackStore,
    stickerPack: StickerPackStore,
    stickerPackDeletion: DeleteStickerPackStore,
    stickerAnimationData: StickerAnimationDataStore,
    stickersPreferences: StickersPreferencesStore,
    stickerPreviewDialog: StickerPreviewDialogStore,
    stickerSuggestions: StickerSuggestionsStore,
    stickerPackImport: ImportStickerPackStore,
    confirmationToken: ConfirmationTokenStore,
    confirmationTokenDialog: CreateConfirmationTokenStore,
    chatOwnershipTransfer: TransferChatOwnershipStore,
    messageReactionOperations: MessageReactionOperationsStore,
    reactionsToMessages: ReactionsToMessagesStore,
    messageReactionsDialog: MessageReactionsDialogStore,
    messageReactionPicker: MessageReactionPickerStore,
}
