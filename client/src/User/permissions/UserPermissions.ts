import {AuthorizationStore} from "../../Authorization";
import {computedFn} from "mobx-utils";
import {isDefined} from "../../utils/object-utils";

export class UserPermissions {
    constructor(private readonly authorization: AuthorizationStore) {
    }

    canUploadProfilePhoto = computedFn((userId: string): boolean => {
        return isDefined(this.authorization.currentUser) && !this.authorization.isCurrentUserBannedGlobally()
            && this.authorization.currentUser.id === userId;
    })

    canDeleteProfilePhoto = computedFn((userId: string): boolean => {
        return isDefined(this.authorization.currentUser)
            && (this.authorization.currentUser.id === userId || this.authorization.currentUserIsAdmin);
    })
}