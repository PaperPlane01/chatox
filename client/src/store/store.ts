import {IAppState} from "./IAppState";
import {AppBarStore} from "../AppBar";
import {AuthorizationStore, LoginStore, LoginWithGoogleStore} from "../Authorization/stores";
import {
    createSetPasswordRecoveryStepCallback,
    PasswordRecoveryDialogStore,
    RecoverPasswordStore,
    SendPasswordRecoveryEmailConfirmationCodeStore
} from "../PasswordRecovery";
import {
    AnonymousRegistrationDialogStore,
    createSetRegistrationStepCallback,
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
import {LocaleStore} from "../localization";
import {EntitiesStore, RawEntitiesStore} from "../entities-store";
import {
    createSetChangePasswordStepCallback,
    EditProfileStore,
    PasswordChangeFormSubmissionStore,
    PasswordChangeStepStore,
    PasswordChangeStore,
    SendPasswordChangeEmailConfirmationCodeStore,
    UserProfileStore
} from "../User";
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
    BlockUserInChatByIdOrSlugStore,
    CancelChatBlockingStore,
    ChatBlockingInfoDialogStore,
    ChatBlockingsDialogStore,
    ChatBlockingsOfChatStore,
    CreateChatBlockingStore,
    UpdateChatBlockingStore
} from "../ChatBlocking";
import {UploadImageStore} from "../Upload";
import {SettingsTabsStore} from "../Settings";
import {CheckEmailConfirmationCodeStore} from "../EmailConfirmation";
import {EmojiSettingsStore} from "../Emoji";
import {AudioPlayerStore} from "../AudioPlayer";
import {DeleteMessageStore} from "../Message/stores/DeleteMessageStore";
import {
    BanUserStore,
    CancelGlobalBanStore,
    GlobalBanDetailsDialogStore,
    GlobalBansListStore,
    UpdateGlobalBanStore
} from "../GlobalBan";
import {
    BanUsersRelatedToSelectedReportsStore,
    CreateReportStore,
    CurrentReportsListStore,
    DeclineSelectedReportsStore,
    reportedChatsCreatorsSelector,
    ReportedMessageDialogStore,
    reportedMessagesSendersSelector,
    reportedUsersSelector,
    ReportsListStore,
    UpdateSelectedReportsStore
} from "../Report";
import {ReportType} from "../api/types/response";
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
import {SnackbarService} from "../Snackbar";

const rawEntities = new RawEntitiesStore();
const authorization = new AuthorizationStore();
const entitiesV2 = new EntitiesStore(rawEntities, authorization);
authorization.setEntities(entitiesV2);

const login = new LoginStore(authorization);
const registrationDialog = new RegistrationDialogStore();
const language = new LocaleStore();
const sendVerificationEmail = new SendConfirmationCodeStore(registrationDialog, language);
const registrationEmailConfirmationCodeCheck = new CheckEmailConfirmationCodeStore(
    createSetRegistrationStepCallback(registrationDialog)
);
const userRegistration = new UserRegistrationStore(
    authorization,
    sendVerificationEmail,
    registrationEmailConfirmationCodeCheck,
    registrationDialog
);
const appBar = new AppBarStore();
const markdownPreviewDialog = new MarkdownPreviewDialogStore();
const chatsOfCurrentUser = new ChatsOfCurrentUserStore(entitiesV2);
const chatCreation = new CreateChatStore(entitiesV2);
const chat = new ChatStore(entitiesV2);
const chatParticipants = new ChatParticipantsStore(entitiesV2, chat);
const messageUploads = new UploadMessageAttachmentsStore();
const messageCreation = new CreateMessageStore(chat, entitiesV2, messageUploads);
const chatsPreferences = new ChatsPreferencesStore();
const messagesSearch = new SearchMessagesStore(entitiesV2, chat);
const messagesOfChat = new MessagesOfChatStore(entitiesV2, chat, chatsPreferences, messagesSearch);
const joinChat = new JoinChatStore(entitiesV2, authorization);
const userProfile = new UserProfileStore(entitiesV2);
const createChatBlocking = new CreateChatBlockingStore(chat, entitiesV2);
const chatBlockingsOfChat = new ChatBlockingsOfChatStore(entitiesV2, chat);
const chatBlockingsDialog = new ChatBlockingsDialogStore();
const cancelChatBlocking = new CancelChatBlockingStore(entitiesV2);
const chatBlockingInfoDialog = new ChatBlockingInfoDialogStore();
const updateChatBlocking = new UpdateChatBlockingStore(entitiesV2);
const chatInfoDialog = new ChatInfoDialogStore();
const blockUserInChatByIdOrSlug = new BlockUserInChatByIdOrSlugStore(entitiesV2, createChatBlocking);
const onlineChatParticipants = new OnlineChatParticipantsStore(entitiesV2, chat);
const chatAvatarUpload = new UploadImageStore(entitiesV2);
const chatUpdate = new UpdateChatStore(chatAvatarUpload, chat, entitiesV2);
const messageDialog = new MessageDialogStore(chat, entitiesV2);
const userAvatarUpload = new UploadImageStore(entitiesV2);
const editProfile = new EditProfileStore(authorization, userAvatarUpload, entitiesV2);
const settingsTabs = new SettingsTabsStore();
const messageUpdate = new UpdateMessageStore(chat, entitiesV2);
const passwordChangeStep = new PasswordChangeStepStore();
const passwordChangeForm = new PasswordChangeFormSubmissionStore(passwordChangeStep);
const passwordChangeEmailConfirmationCodeSending = new SendPasswordChangeEmailConfirmationCodeStore(
    language,
    passwordChangeStep
);
const  passwordChangeEmailConfirmationCodeCheck = new CheckEmailConfirmationCodeStore(
    createSetChangePasswordStepCallback(passwordChangeStep)
);
const passwordChange = new PasswordChangeStore(
    passwordChangeForm,
    passwordChangeEmailConfirmationCodeSending,
    passwordChangeEmailConfirmationCodeCheck,
    passwordChangeStep,
    authorization
);
const emoji = new EmojiSettingsStore();
const audioPlayer = new AudioPlayerStore();
const messageFileDownload = new DownloadMessageFileStore();
const passwordRecoveryDialog = new PasswordRecoveryDialogStore();
const passwordRecoveryEmailConfirmationCodeSending = new SendPasswordRecoveryEmailConfirmationCodeStore(
    passwordRecoveryDialog,
    language
);
const passwordRecoveryEmailConfirmationCodeCheck = new CheckEmailConfirmationCodeStore(
    createSetPasswordRecoveryStepCallback(passwordRecoveryDialog)
);
const passwordRecoveryForm = new RecoverPasswordStore(
    passwordRecoveryDialog,
    passwordRecoveryEmailConfirmationCodeSending,
    passwordRecoveryEmailConfirmationCodeCheck
);
const leaveChat = new LeaveChatStore(entitiesV2);
const popularChats = new PopularChatsStore(entitiesV2);
const messageDeletion = new DeleteMessageStore(entitiesV2, chat);
const anonymousRegistration = new AnonymousRegistrationDialogStore(authorization);
const kickFromChat = new KickChatParticipantStore(entitiesV2, chat);
const chatDeletion = new DeleteChatStore(entitiesV2, chat);
const userGlobalBan = new BanUserStore(entitiesV2);
const globalBansList = new GlobalBansListStore(entitiesV2);
const globalBanDetailsDialog = new GlobalBanDetailsDialogStore();
const cancelGlobalBan = new CancelGlobalBanStore(entitiesV2);
const updateGlobalBan = new UpdateGlobalBanStore(entitiesV2);
const pinMessage = new PinMessageStore(entitiesV2, chat);
const unpinMessage = new UnpinMessageStore(entitiesV2, chat);
const closedPinnedMessages = new ClosedPinnedMessagesStore();
const pinnedMessages = new PinnedMessagesStore(entitiesV2, chat, closedPinnedMessages);
const scheduleMessage = new ScheduleMessageStore(messageCreation);
const scheduledMessagesOfChat = new ScheduledMessagesOfChatStore(entitiesV2, chat);
const publishScheduledMessage = new PublishScheduledMessageStore(entitiesV2, chat);
const deleteScheduledMessage = new DeleteScheduledMessageStore(entitiesV2, chat);
const updateScheduledMessage = new UpdateScheduledMessageStore(entitiesV2);
const reportMessage = new CreateReportStore(ReportType.MESSAGE);
const messageReports = new ReportsListStore(entitiesV2, authorization, ReportType.MESSAGE);
const reportedMessageDialog = new ReportedMessageDialogStore();
const currentReportsList = new CurrentReportsListStore();
const selectedReportsUpdate = new UpdateSelectedReportsStore(entitiesV2, currentReportsList)
const selectedReportedMessagesDeletion = new DeleteSelectedReportedMessagesStore(messageReports, selectedReportsUpdate);
const selectedReportedMessagesSendersBan = new BanUsersRelatedToSelectedReportsStore(entitiesV2, messageReports, selectedReportsUpdate, reportedMessagesSendersSelector);
const declineReports = new DeclineSelectedReportsStore(selectedReportsUpdate);
const reportUser = new CreateReportStore(ReportType.USER);
const userReports = new ReportsListStore(entitiesV2, authorization, ReportType.USER);
const selectedReportedUsersBan = new BanUsersRelatedToSelectedReportsStore(entitiesV2, userReports, selectedReportsUpdate, reportedUsersSelector);
const reportChat = new CreateReportStore(ReportType.CHAT);
const chatReports = new ReportsListStore(entitiesV2, authorization, ReportType.CHAT);
const selectedReportedChatsCreatorsBan = new BanUsersRelatedToSelectedReportsStore(entitiesV2, chatReports, selectedReportsUpdate, reportedChatsCreatorsSelector);
const googleLogin = new LoginWithGoogleStore(authorization);
const messagesListScrollPositions = new MessagesListScrollPositionsStore(chat);
const markMessageRead = new MarkMessageReadStore(entitiesV2, chat, messagesListScrollPositions);
const websocket = new WebsocketStore(authorization, entitiesV2, chat, messagesListScrollPositions, markMessageRead);
const stickerPackCreation = new CreateStickerPackStore(entitiesV2);
const stickerEmojiPickerDialog = new StickerEmojiPickerDialogStore();
const installedStickerPacks = new InstalledStickerPacksStore(authorization, entitiesV2);
const stickerPackInstallation = new InstallStickerPackStore(installedStickerPacks);
const stickerPackUninstallation = new UninstallStickerPackStore(installedStickerPacks);
const stickerPacksSearch = new SearchStickerPacksStore(entitiesV2);
const stickerPackDialog = new StickerPackDialogStore();
const stickerPicker = new StickerPickerStore(installedStickerPacks, authorization);
const emojiPickerTabs = new EmojiPickerTabsStore();
const blacklistedUsers = new BlacklistedUsersStore(entitiesV2);
const addUserToBlacklist = new AddUserToBlacklistStore(blacklistedUsers);
const removeUserFromBlacklist = new RemoveUserFromBlacklistStore(blacklistedUsers);
const chatsAndMessagesSearchQuery = new ChatsAndMessagesSearchQueryStore();
const allChatsMessagesSearch = new AllChatsMessagesSearchStore(chatsAndMessagesSearchQuery, entitiesV2);
const chatsOfCurrentUserSearch = new ChatsOfCurrentUserSearchStore(chatsAndMessagesSearchQuery, entitiesV2);
const rolesOfChats = new RolesOfChatStore(chat, entitiesV2);
const userChatRoles = new UserChatRolesStore(entitiesV2);
const chatFeaturesForm = ChatFeaturesFormStore.createInstance(entitiesV2);
const updateChatParticipant = new UpdateChatParticipantStore(entitiesV2, authorization, userChatRoles);
const chatRoleInfo = new ChatRoleInfoDialogStore();
const snackbarService = new SnackbarService();
const editChatRole = new EditChatRoleStore(chatFeaturesForm, entitiesV2, language, snackbarService, chatRoleInfo);
const createChatRole = new CreateChatRoleStore(chatFeaturesForm, entitiesV2, language, snackbarService, chat, rolesOfChats);

export const store: IAppState = {
    authorization,
    login,
    userRegistration,
    language,
    appBar,
    chatCreation,
    markdownPreviewDialog,
    entities: entitiesV2,
    chatsOfCurrentUser,
    chat,
    chatParticipants,
    messageCreation,
    messagesOfChat,
    joinChat,
    websocket,
    userProfile,
    createChatBlocking,
    chatBlockingsOfChat,
    chatBlockingsDialog,
    cancelChatBlocking,
    chatBlockingInfoDialog,
    updateChatBlocking,
    chatInfoDialog,
    blockUserInChatByIdOrSlug,
    onlineChatParticipants,
    chatAvatarUpload,
    chatUpdate,
    sendVerificationEmail,
    registrationEmailConfirmationCodeCheck,
    registrationDialog,
    messageDialog,
    userAvatarUpload,
    editProfile,
    settingsTabs,
    messageUpdate,
    passwordChangeStep,
    passwordChangeEmailConfirmationCodeCheck,
    passwordChangeEmailConfirmationCodeSending,
    passwordChangeForm,
    passwordChange,
    chatsPreferences,
    emoji,
    messageUploads,
    audioPlayer,
    messageFileDownload,
    passwordRecoveryDialog,
    passwordRecoveryEmailConfirmationCodeCheck,
    passwordRecoveryEmailConfirmationCodeSending,
    passwordRecoveryForm,
    leaveChat,
    popularChats,
    messageDeletion,
    anonymousRegistration,
    kickFromChat,
    chatDeletion,
    userGlobalBan,
    globalBansList,
    globalBanDetailsDialog,
    cancelGlobalBan,
    updateGlobalBan,
    updateChatParticipant,
    pinnedMessages,
    pinMessage,
    unpinMessage,
    closedPinnedMessages,
    scheduleMessage,
    scheduledMessagesOfChat,
    publishScheduledMessage,
    deleteScheduledMessage,
    updateScheduledMessage,
    reportMessage,
    messageReports,
    reportedMessageDialog,
    selectedReportsUpdate,
    selectedReportedMessagesDeletion,
    selectedReportedMessagesSendersBan,
    declineReports,
    currentReportsList,
    reportUser,
    userReports,
    selectedReportedUsersBan,
    reportChat,
    chatReports,
    selectedReportedChatsCreatorsBan,
    googleLogin,
    messagesListScrollPositions,
    markMessageRead,
    stickerPackCreation,
    stickerEmojiPickerDialog,
    installedStickerPacks,
    stickerPackInstallation,
    stickerPackUninstallation,
    stickerPacksSearch,
    stickerPackDialog,
    stickerPicker,
    emojiPickerTabs,
    blacklistedUsers,
    addUserToBlacklist,
    removeUserFromBlacklist,
    messagesSearch,
    chatsAndMessagesSearchQuery,
    allChatsMessagesSearch,
    chatsOfCurrentUserSearch,
    rolesOfChats,
    userChatRoles,
    chatFeaturesForm,
    chatRoleInfo,
    editChatRole,
    createChatRole,
    rawEntities
};
