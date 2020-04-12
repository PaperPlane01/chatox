import {action, observable} from "mobx";
import {UserApi} from "../../api/clients";
import {ApiError, getInitialApiErrorFromResponse} from "../../api";
import {EntitiesStore} from "../../entities-store";

export class UserProfileStore {
    @observable
    selectedUserId?: string = undefined;

    @observable
    pending: boolean = false;

    @observable
    error?: ApiError = undefined;

    constructor(private readonly entities: EntitiesStore) {}

    @action
    setSelectedUser = (slug: string): void => {
        const user = this.entities.users.findByIdOrSlug(slug);

        if (user) {
            this.selectedUserId = user.id;
        } else {
            this.pending = true;
            this.error = undefined;

            UserApi.getUserByIdOrSlug(slug)
                .then(({data}) => {
                    this.entities.insertUser(data);
                    this.selectedUserId = data.id;
                    this.pending = false;
                })
                .catch(error => this.error = getInitialApiErrorFromResponse(error))
                .finally(() => this.pending = false);
        }
    }
}
