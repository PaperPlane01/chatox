import {IAppState} from "./IAppState";
import {AppBarStore} from "../AppBar";
import {AuthorizationStore, LoginStore} from "../Authorization";
import {UserRegistrationStore} from "../Registration";
import {
    ChatsStore,
    ChatsOfCurrentUserStore,
    ChatStore,
    CreateChatStore,
    ChatParticipationsStore,
    ChatParticipantsStore,
    JoinChatStore
} from "../Chat";
import {MarkdownPreviewDialogStore} from "../Markdown";
import {LocaleStore} from "../localization";
import {EntitiesStore} from "../entities-store";
import {UsersStore, UserProfileStore} from "../User/stores";
import {CreateMessageStore, MessagesOfChatStore, MessagesStore} from "../Message/stores";
import {WebsocketStore} from "../websocket";
import {ChatBlockingsStore, CreateChatBlockingStore} from "../ChatBlocking/stores";

const messages = new MessagesStore();
const chatsOfCurrentUserEntities = new ChatsStore();
const usersStore = new UsersStore();
const chatParticipations = new ChatParticipationsStore();
const chatBlockings = new ChatBlockingsStore(usersStore);
const entities = new EntitiesStore(
    messages,
    chatsOfCurrentUserEntities,
    usersStore,
    chatParticipations,
    chatBlockings
);
const authorization = new AuthorizationStore(entities);

entities.setAuthorizationStore(authorization);

const login = new LoginStore(authorization);
const userRegistration = new UserRegistrationStore(authorization);
const language = new LocaleStore();
const appBar = new AppBarStore();
const markdownPreviewDialog = new MarkdownPreviewDialogStore();
const chatsOfCurrentUser = new ChatsOfCurrentUserStore(entities);
const chatCreation = new CreateChatStore(entities);
const chat = new ChatStore(entities);
const chatParticipants = new ChatParticipantsStore(entities, chat);
const messageCreation = new CreateMessageStore(chat, entities);
const messagesOfChat = new MessagesOfChatStore(entities, chat);
const joinChat = new JoinChatStore(entities, authorization);
const websocket = new WebsocketStore(authorization, entities);
const userProfile = new UserProfileStore(entities);
const createChatBlocking = new CreateChatBlockingStore(chat, entities);

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
    createChatBlocking
};

export interface MapMobxToProps<ComponentProps = {}> {
    (state: IAppState): ComponentProps
}
