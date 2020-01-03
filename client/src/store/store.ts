import {IAppState} from "./IAppState";
import {LoginStore, AuthorizationStore} from "../Authorization";
import {UserRegistrationStore} from "../Registration";
import {LocaleStore} from "../localization/stores";

const authorization = new AuthorizationStore();
const login = new LoginStore(authorization);
const userRegistration = new UserRegistrationStore(authorization);
const language = new LocaleStore();

export const store: IAppState = {
    authorization,
    login,
    userRegistration,
    language
};
