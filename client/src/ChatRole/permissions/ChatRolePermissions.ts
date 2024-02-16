import {makeAutoObservable} from "mobx";
import {computedFn} from "mobx-utils";
import {UserChatRolesStore} from "../stores";
import {EntitiesStore} from "../../entities-store";
import {AuthorizationStore} from "../../Authorization";
import {ChatFeatures, CurrentUser} from "../../api/types/response";

export class ChatRolePermissions {
    get currentUser(): CurrentUser | undefined {
        return this.authorization.currentUser;
    }

    constructor(private readonly entities: EntitiesStore,
                private readonly authorization: AuthorizationStore,
                private readonly userChatRoles: UserChatRolesStore) {
        makeAutoObservable(this);
    }

    canCreateChatRole = computedFn((chatId: string): boolean => {
        if (!this.currentUser) {
            return false;
        }

        const chatRole = this.userChatRoles.getRoleOfUserInChat({
            chatId,
            userId: this.currentUser.id
        });

        if (!chatRole) {
            return false;
        }

        return chatRole.features.modifyChatRoles.enabled;
    })

    canEnableFeature = computedFn((chatId: string, feature: keyof ChatFeatures): boolean => {
        return this.getFeaturesWhichCanBeEnabled(chatId).includes(feature);
    });

    getFeaturesWhichCanBeEnabled = computedFn((chatId: string): Array<keyof ChatFeatures> => {
        if (!this.currentUser) {
            return [];
        }

        const chatRole = this.userChatRoles.getRoleOfUserInChat({
            chatId,
            userId: this.currentUser.id
        });

        if (!chatRole) {
            return [];
        }

        const featureNames = Object.keys(chatRole.features) as Array<keyof ChatFeatures>;

        return featureNames.filter(featureName => chatRole.features[featureName].enabled);
    });
}