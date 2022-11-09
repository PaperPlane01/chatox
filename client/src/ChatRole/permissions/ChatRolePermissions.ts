import {computed} from "mobx";
import {createTransformer} from "mobx-utils";
import {UserChatRolesStore} from "../stores";
import {EntitiesStore} from "../../entities-store";
import {AuthorizationStore} from "../../Authorization";
import {ChatFeatures, CurrentUser} from "../../api/types/response";

interface CanEnableFeature {
    feature: keyof ChatFeatures,
    chatId: string
}

export class ChatRolePermissions {
    @computed
    get currentUser(): CurrentUser | undefined {
        return this.authorization.currentUser;
    }

    constructor(private readonly entities: EntitiesStore,
                private readonly authorization: AuthorizationStore,
                private readonly userChatRoles: UserChatRolesStore) {
    }

    canCreateChatRole = createTransformer((chatId: string): boolean => {
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

    canEnableFeature = createTransformer(({chatId, feature}: CanEnableFeature): boolean => {
        return this.getFeaturesWhichCanBeEnabled(chatId).includes(feature);
    });

    getFeaturesWhichCanBeEnabled = createTransformer((chatId: string): Array<keyof ChatFeatures> => {
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