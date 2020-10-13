import {IAppState} from "./IAppState";
import {AppBarStore} from "../AppBar";
import {AuthorizationStore, LoginStore,} from "../Authorization/stores";
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
    JoinChatStore,
    KickChatParticipantStore,
    LeaveChatStore,
    OnlineChatParticipantsStore,
    PopularChatsStore,
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
    CreateMessageStore,
    DownloadMessageFileStore,
    MessageDialogStore,
    MessagesOfChatStore,
    MessagesStore,
    UpdateMessageStore,
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
import {CheckEmailConfirmationCodeStore} from "../EmailConfirmation/stores";
import {EmojiSettingsStore} from "../Emoji/stores";
import {AudioPlayerStore} from "../AudioPlayer/stores";
import {DeleteMessageStore} from "../Message/stores/DeleteMessageStore";

const messages = new MessagesStore();
const chatsOfCurrentUserEntities = new ChatsStore();
const usersStore = new UsersStore();
const chatParticipations = new ChatParticipationsStore();
const chatBlockings = new ChatBlockingsStore(usersStore);
const uploads = new UploadsStore();
const chatUploads = new ChatUploadsStore();
const entities = new EntitiesStore(
    messages,
    chatsOfCurrentUserEntities,
    usersStore,
    chatParticipations,
    chatBlockings,
    uploads,
    chatUploads
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
const websocket = new WebsocketStore(authorization, entities);
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
    kickFromChat
};
