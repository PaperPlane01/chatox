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
    DeleteMessageStore,
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
    DeleteSelectedReportedMessagesStore,
    reportedChatsCreatorsSelector,
    ReportedMessageDialogStore,
    reportedMessagesSendersSelector,
    reportedUsersSelector,
    ReportsListStore,
    UpdateSelectedReportsStore
} from "../Report";
import {ReportType} from "../api/types/response";
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
const entities = new EntitiesStore(rawEntities, authorization);
authorization.setEntities(entities);

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
const chatsOfCurrentUser = new ChatsOfCurrentUserStore(entities);
const chatCreation = new CreateChatStore(entities);
const chat = new ChatStore(entities);
const chatParticipants = new ChatParticipantsStore(entities, chat);
const messageUploads = new UploadMessageAttachmentsStore();
const messageCreation = new CreateMessageStore(chat, entities, messageUploads);
const chatsPreferences = new ChatsPreferencesStore();
const messagesSearch = new SearchMessagesStore(entities, chat);
const messagesOfChat = new MessagesOfChatStore(entities, chat, chatsPreferences, messagesSearch);
const joinChat = new JoinChatStore(entities, authorization);
const userProfile = new UserProfileStore(entities);
const createChatBlocking = new CreateChatBlockingStore(chat, entities);
const chatBlockingsOfChat = new ChatBlockingsOfChatStore(entities, chat);
const chatBlockingsDialog = new ChatBlockingsDialogStore();
const cancelChatBlocking = new CancelChatBlockingStore(entities);
const chatBlockingInfoDialog = new ChatBlockingInfoDialogStore();
const updateChatBlocking = new UpdateChatBlockingStore(entities);
const chatInfoDialog = new ChatInfoDialogStore();
const blockUserInChatByIdOrSlug = new BlockUserInChatByIdOrSlugStore(entities, createChatBlocking);
const onlineChatParticipants = new OnlineChatParticipantsStore(entities, chat);
const chatAvatarUpload = new UploadImageStore(entities);
const chatUpdate = new UpdateChatStore(chatAvatarUpload, chat, entities);
const messageDialog = new MessageDialogStore(chat, entities);
const userAvatarUpload = new UploadImageStore(entities);
const editProfile = new EditProfileStore(authorization, userAvatarUpload, entities);
const settingsTabs = new SettingsTabsStore();
const messageUpdate = new UpdateMessageStore(chat, entities);
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
const leaveChat = new LeaveChatStore(entities);
const popularChats = new PopularChatsStore(entities);
const messageDeletion = new DeleteMessageStore(entities, chat);
const anonymousRegistration = new AnonymousRegistrationDialogStore(authorization);
const kickFromChat = new KickChatParticipantStore(entities, chat);
const chatDeletion = new DeleteChatStore(entities, chat);
const userGlobalBan = new BanUserStore(entities);
const globalBansList = new GlobalBansListStore(entities);
const globalBanDetailsDialog = new GlobalBanDetailsDialogStore();
const cancelGlobalBan = new CancelGlobalBanStore(entities);
const updateGlobalBan = new UpdateGlobalBanStore(entities);
const pinMessage = new PinMessageStore(entities, chat);
const unpinMessage = new UnpinMessageStore(entities, chat);
const closedPinnedMessages = new ClosedPinnedMessagesStore();
const pinnedMessages = new PinnedMessagesStore(entities, chat, closedPinnedMessages);
const scheduleMessage = new ScheduleMessageStore(messageCreation);
const scheduledMessagesOfChat = new ScheduledMessagesOfChatStore(entities, chat);
const publishScheduledMessage = new PublishScheduledMessageStore(entities, chat);
const deleteScheduledMessage = new DeleteScheduledMessageStore(entities, chat);
const updateScheduledMessage = new UpdateScheduledMessageStore(entities);
const reportMessage = new CreateReportStore(ReportType.MESSAGE);
const messageReports = new ReportsListStore(entities, authorization, ReportType.MESSAGE);
const reportedMessageDialog = new ReportedMessageDialogStore();
const currentReportsList = new CurrentReportsListStore();
const selectedReportsUpdate = new UpdateSelectedReportsStore(entities, currentReportsList)
const selectedReportedMessagesDeletion = new DeleteSelectedReportedMessagesStore(messageReports, selectedReportsUpdate);
const selectedReportedMessagesSendersBan = new BanUsersRelatedToSelectedReportsStore(
    entities,
    messageReports,
    selectedReportsUpdate,
    reportedMessagesSendersSelector
);
const declineReports = new DeclineSelectedReportsStore(selectedReportsUpdate);
const reportUser = new CreateReportStore(ReportType.USER);
const userReports = new ReportsListStore(entities, authorization, ReportType.USER);
const selectedReportedUsersBan = new BanUsersRelatedToSelectedReportsStore(
    entities,
    userReports,
    selectedReportsUpdate,
    reportedUsersSelector
);
const reportChat = new CreateReportStore(ReportType.CHAT);
const chatReports = new ReportsListStore(entities, authorization, ReportType.CHAT);
const selectedReportedChatsCreatorsBan = new BanUsersRelatedToSelectedReportsStore(
    entities,
    chatReports,
    selectedReportsUpdate,
    reportedChatsCreatorsSelector
);
const googleLogin = new LoginWithGoogleStore(authorization);
const messagesListScrollPositions = new MessagesListScrollPositionsStore(chat);
const markMessageRead = new MarkMessageReadStore(entities, chat, messagesListScrollPositions);
const websocket = new WebsocketStore(authorization, entities, chat, messagesListScrollPositions, markMessageRead);
const stickerPackCreation = new CreateStickerPackStore(entities);
const stickerEmojiPickerDialog = new StickerEmojiPickerDialogStore();
const installedStickerPacks = new InstalledStickerPacksStore(authorization, entities);
const stickerPackInstallation = new InstallStickerPackStore(installedStickerPacks);
const stickerPackUninstallation = new UninstallStickerPackStore(installedStickerPacks);
const stickerPacksSearch = new SearchStickerPacksStore(entities);
const stickerPackDialog = new StickerPackDialogStore();
const stickerPicker = new StickerPickerStore(installedStickerPacks, authorization);
const emojiPickerTabs = new EmojiPickerTabsStore();
const blacklistedUsers = new BlacklistedUsersStore(entities);
const addUserToBlacklist = new AddUserToBlacklistStore(blacklistedUsers);
const removeUserFromBlacklist = new RemoveUserFromBlacklistStore(blacklistedUsers);
const chatsAndMessagesSearchQuery = new ChatsAndMessagesSearchQueryStore();
const allChatsMessagesSearch = new AllChatsMessagesSearchStore(chatsAndMessagesSearchQuery, entities);
const chatsOfCurrentUserSearch = new ChatsOfCurrentUserSearchStore(chatsAndMessagesSearchQuery, entities);
const rolesOfChats = new RolesOfChatStore(chat, entities);
const userChatRoles = new UserChatRolesStore(entities);
const chatFeaturesForm = ChatFeaturesFormStore.createInstance(entities);
const updateChatParticipant = new UpdateChatParticipantStore(entities, authorization, userChatRoles);
const chatRoleInfo = new ChatRoleInfoDialogStore();
const snackbarService = new SnackbarService();
const editChatRole = new EditChatRoleStore(chatFeaturesForm, entities, language, snackbarService, chatRoleInfo);
const createChatRole = new CreateChatRoleStore(chatFeaturesForm, entities, language, snackbarService, chat, rolesOfChats);

export const store: IAppState = {
    authorization,
    login,
    userRegistration,
    language,
    appBar,
    chatCreation,
    markdownPreviewDialog,
    entities,
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
