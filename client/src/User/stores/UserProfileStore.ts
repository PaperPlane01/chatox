import {makeAutoObservable} from "mobx";
import {ApiError, getInitialApiErrorFromResponse, UserApi} from "../../api";
import {EntitiesStore} from "../../entities-store";

export class UserProfileStore {
    selectedUserId?: string = undefined;

    pending: boolean = false;

    error?: ApiError = undefined;

    constructor(private readonly entities: EntitiesStore) {
       makeAutoObservable(this);
    }

    setSelectedUser = (slug?: string): void => {
        if (!slug) {
            return;
        }

        const user = this.entities.users.findByIdOrSlug(slug);

        if (user) {
            this.selectedUserId = user.id;
        } else {
            this.pending = true;
            this.error = undefined;

            UserApi.getUserByIdOrSlug(slug)
                .then(({data}) => {
                    this.entities.users.insert(data);
                    this.selectedUserId = data.id;
                    this.pending = false;
                })
                .catch(error => this.error = getInitialApiErrorFromResponse(error))
                .finally(() => this.pending = false);
        }
    };
}
