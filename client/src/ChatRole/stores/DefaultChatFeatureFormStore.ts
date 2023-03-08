import {action, makeObservable} from "mobx";
import {EntitiesStore} from "../../entities-store";
import {ChatFeatures} from "../../api/types/response";
import {AbstractChatFeatureFormStore} from "./AbstractChatFeatureFormStore";
import {ChatFeatureFormData} from "../types";
import {ConvertableChatFeatureFormStore} from "./ConvertableChatFeatureFormStore";

export class DefaultChatFeatureFormStore
    extends AbstractChatFeatureFormStore<ChatFeatureFormData>
    implements ConvertableChatFeatureFormStore<"kickUsers" | "scheduleMessages" | "deleteChat" | "changeChatSettings" | "modifyChatRoles" | "showRoleNameInMessages" | "pinMessages">{

    constructor(private readonly entitiesStore: EntitiesStore,
                private readonly featureName: keyof ChatFeatures,
                initialValues: ChatFeatureFormData = {enabled: false}) {
        super(
            initialValues,
            {enabled: undefined}
        );

        makeObservable(this, {
            populateFromRole: action
        });
    }

    populateFromRole = (roleId: string): void => {
        const role = this.entitiesStore.chatRoles.findByIdOptional(roleId);

        if (!role) {
            return;
        }

        const feature = role.features[this.featureName];

        this.setForm({
            enabled: feature.enabled
        });
    }

    convertToApiRequest(): ChatFeatures["kickUsers" | "scheduleMessages" | "deleteChat" | "changeChatSettings" | "modifyChatRoles" | "showRoleNameInMessages" | "pinMessages"] {
        return {
            enabled: Boolean(this.formValues.enabled),
            additional: {}
        };
    }
}