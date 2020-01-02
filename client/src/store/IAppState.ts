import {LocaleStore} from "../localization";
import {AuthorizationStore} from "../Authorization";
import {UserRegistrationStore} from "../Registration";

export interface IAppState {
    language: LocaleStore,
    authorization: AuthorizationStore,
    userRegistration: UserRegistrationStore
}
