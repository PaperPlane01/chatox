import {action, observable, reaction} from "mobx";
import {BlockUsersFeatureFormStore} from "./BlockUsersFeatureFormStore";
import {SendMessagesFeatureFormStore} from "./SendMessagesFeatureFormStore";
import {DefaultChatFeatureFormStore} from "./DefaultChatFeatureFormStore";
import {LevelBasedChatFeatureFromStore} from "./LevelBasedChatFeatureFromStore";
import {EntitiesStoreV2} from "../../entities-store";
import {ChatFeatures} from "../../api/types/response";

interface FeaturesForms {
    blockUsers: BlockUsersFeatureFormStore,
    sendMessages: SendMessagesFeatureFormStore,
    kickUsers: DefaultChatFeatureFormStore,
    deleteOwnMessages: DefaultChatFeatureFormStore,
    deleteOtherUsersMessages: LevelBasedChatFeatureFromStore,
    scheduleMessages: DefaultChatFeatureFormStore,
    changeChatSettings: DefaultChatFeatureFormStore,
    modifyChatRoles: DefaultChatFeatureFormStore,
    assignChatRole: LevelBasedChatFeatureFromStore,
    kickImmunity: LevelBasedChatFeatureFromStore,
    blockingImmunity: LevelBasedChatFeatureFromStore,
    messageDeletionsImmunity: LevelBasedChatFeatureFromStore,
    showRoleNameInMessages: DefaultChatFeatureFormStore,
    pinMessages: DefaultChatFeatureFormStore,
    deleteChat: DefaultChatFeatureFormStore
}

export class ChatFeaturesFormStore {
    featuresForms: FeaturesForms;

    @observable
    roleId?: string = undefined;

    private constructor(featuresForms: FeaturesForms) {
        this.featuresForms = featuresForms;

        reaction(
            () => this.roleId,
            roleId => {
                const forms = this.getFeatureFormsArray();

                if (roleId) {
                    forms.forEach(form => form.populateFromRole(roleId));
                } else {
                    forms.forEach(form => form.resetForm());
                }
            }
        );
    }

    @action
    setRoleId = (roleId?: string): void => {
        this.roleId = roleId;
    }

    @action
    clearRoleId = (): void => this.setRoleId(undefined);

    @action
    validateForms = (): boolean => {
        return this
            .getFeatureFormsArray()
            .map(form => form.validateForm())
            .filter(formValid => !formValid)
            .length === 0;
    }

    convertToApiRequest = (): ChatFeatures => {
        const chatFeatures: any = {};

        Object.keys(this.featuresForms).forEach(key => {
            const form = this.featuresForms[key as keyof FeaturesForms];
            chatFeatures[key] = form.convertToApiRequest();
        });

        return chatFeatures as ChatFeatures;
    }


    private getFeatureFormsArray() {
        return [
            this.featuresForms.blockUsers,
            this.featuresForms.sendMessages,
            this.featuresForms.kickUsers,
            this.featuresForms.deleteOwnMessages,
            this.featuresForms.deleteOtherUsersMessages,
            this.featuresForms.scheduleMessages,
            this.featuresForms.changeChatSettings,
            this.featuresForms.modifyChatRoles,
            this.featuresForms.assignChatRole,
            this.featuresForms.kickImmunity,
            this.featuresForms.blockingImmunity,
            this.featuresForms.messageDeletionsImmunity,
            this.featuresForms.showRoleNameInMessages,
            this.featuresForms.pinMessages,
            this.featuresForms.deleteChat
        ];
    }

    public static createInstance(entities: EntitiesStoreV2): ChatFeaturesFormStore {
        const blockUsers = new BlockUsersFeatureFormStore(entities);
        const sendMessages = new SendMessagesFeatureFormStore(entities);
        const kickUsers = new DefaultChatFeatureFormStore(entities, "kickUsers");
        const deleteOwnMessages = new DefaultChatFeatureFormStore(entities, "deleteOwnMessages");
        const deleteOtherUsersMessages = new LevelBasedChatFeatureFromStore(entities, "deleteOtherUsersMessages");
        const scheduleMessages = new DefaultChatFeatureFormStore(entities, "scheduleMessages");
        const changeChatSettings = new DefaultChatFeatureFormStore(entities, "changeChatSettings");
        const modifyChatRoles = new DefaultChatFeatureFormStore(entities, "modifyChatRoles");
        const assignChatRole = new LevelBasedChatFeatureFromStore(entities, "assignChatRole");
        const kickImmunity = new LevelBasedChatFeatureFromStore(entities, "kickImmunity");
        const blockingImmunity = new LevelBasedChatFeatureFromStore(entities, "blockingImmunity");
        const messageDeletionsImmunity = new LevelBasedChatFeatureFromStore(entities, "messageDeletionsImmunity");
        const showRoleNameInMessages = new DefaultChatFeatureFormStore(entities, "showRoleNameInMessages");
        const pinMessages = new DefaultChatFeatureFormStore(entities, "pinMessages");
        const deleteChat = new DefaultChatFeatureFormStore(entities, "deleteChat");

        return new ChatFeaturesFormStore({
            blockUsers,
            sendMessages,
            kickUsers,
            deleteOwnMessages,
            deleteOtherUsersMessages,
            scheduleMessages,
            changeChatSettings,
            modifyChatRoles,
            assignChatRole,
            kickImmunity,
            blockingImmunity,
            messageDeletionsImmunity,
            showRoleNameInMessages,
            pinMessages,
            deleteChat
        });
    }
}