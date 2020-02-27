import {IAppState} from "./IAppState";
import {AppBarStore} from "../AppBar";
import {LoginStore, AuthorizationStore} from "../Authorization";
import {UserRegistrationStore} from "../Registration";
import {CreateChatStore} from "../Chat";
import {LocaleStore} from "../localization";

const authorization = new AuthorizationStore();
const login = new LoginStore(authorization);
const userRegistration = new UserRegistrationStore(authorization);
const language = new LocaleStore();
const appBar = new AppBarStore();
const chatCreation = new CreateChatStore();

export const store: IAppState = {
    authorization,
    login,
    userRegistration,
    language,
    appBar,
    chatCreation
};

export interface MapMobxToProps<ComponentProps = {}> {
    (state: IAppState): ComponentProps
}
