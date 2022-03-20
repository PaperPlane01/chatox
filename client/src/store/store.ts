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
    ChatParticipationsStore,
    ChatsOfCurrentUserStore,
    ChatsPreferencesStore,
    ChatsStore,
    ChatStore,
    ChatUploadsStore,
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
import {EntitiesStore} from "../entities-store";
import {
    createSetChangePasswordStepCallback,
    EditProfileStore,
    PasswordChangeFormSubmissionStore,
    PasswordChangeStepStore,
    PasswordChangeStore,
    SendPasswordChangeEmailConfirmationCodeStore,
    UserProfileStore,
    UsersStore
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
    MessagesStore,
    PinMessageStore,
    PinnedMessagesStore,
    PublishScheduledMessageStore,
    ScheduledMessagesOfChatStore,
    ScheduledMessagesStore,
    ScheduleMessageStore,
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
    ChatBlockingsStore,
    CreateChatBlockingStore,
    UpdateChatBlockingStore
} from "../ChatBlocking";
import {UploadImageStore, UploadsStore} from "../Upload";
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
    GlobalBansStore,
    UpdateGlobalBanStore
} from "../GlobalBan";
import {
    BanUsersRelatedToSelectedReportsStore,
    CreateReportStore,
    CurrentReportsListStore,
    DeclineSelectedReportsStore,
    reportedChatsCreatorsSelector,
    ReportedChatsStore,
    ReportedMessageDialogStore,
    reportedMessagesSendersSelector,
    reportedUsersSelector,
    ReportsListStore,
    ReportsStore,
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
    StickerPacksStore,
    StickerPickerStore,
    StickersStore,
    UninstallStickerPackStore
} from "../Sticker";
import {AddUserToBlacklistStore, BlacklistedUsersStore, RemoveUserFromBlacklistStore} from "../Blacklist";

const messages = new MessagesStore();
const chatsOfCurrentUserEntities = new ChatsStore();
const usersStore = new UsersStore();
const chatParticipations = new ChatParticipationsStore();
const chatBlockings = new ChatBlockingsStore(usersStore);
const uploads = new UploadsStore();
const chatUploads = new ChatUploadsStore();
const globalBans = new GlobalBansStore();
const scheduledMessages = new ScheduledMessagesStore();
const reports = new ReportsStore();
const reportedMessages = new MessagesStore();
const reportedMessagesSenders = new UsersStore();
const reportedUsers = new UsersStore();
const reportedChats = new ReportedChatsStore();
const stickers = new StickersStore();
const stickerPacks = new StickerPacksStore();
const entities = new EntitiesStore(
    messages,
    chatsOfCurrentUserEntities,
    usersStore,
    chatParticipations,
    chatBlockings,
    uploads,
    chatUploads,
    globalBans,
    scheduledMessages,
    reports,
    reportedMessages,
    reportedMessagesSenders,
    reportedUsers,
    reportedChats,
    stickers,
    stickerPacks
);
const authorization = new AuthorizationStore(entities);

entities.setAuthorizationStore(authorization);

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
const messagesOfChat = new MessagesOfChatStore(entities, chat, chatsPreferences);
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
const messageDialog = new MessageDialogStore();
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
const updateChatParticipant = new UpdateChatParticipantStore(entities);
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
const selectedReportedMessagesSendersBan = new BanUsersRelatedToSelectedReportsStore(entities, messageReports, selectedReportsUpdate, reportedMessagesSendersSelector);
const declineReports = new DeclineSelectedReportsStore(selectedReportsUpdate);
const reportUser = new CreateReportStore(ReportType.USER);
const userReports = new ReportsListStore(entities, authorization, ReportType.USER);
const selectedReportedUsersBan = new BanUsersRelatedToSelectedReportsStore(entities, userReports, selectedReportsUpdate, reportedUsersSelector);
const reportChat = new CreateReportStore(ReportType.CHAT);
const chatReports = new ReportsListStore(entities, authorization, ReportType.CHAT);
const selectedReportedChatsCreatorsBan = new BanUsersRelatedToSelectedReportsStore(entities, chatReports, selectedReportsUpdate, reportedChatsCreatorsSelector);
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
    removeUserFromBlacklist
};
