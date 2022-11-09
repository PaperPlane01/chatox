import {action} from "mobx";
import {AbstractChatFeatureFormStore} from "./AbstractChatFeatureFormStore";
import {ConvertableChatFeatureFormStore} from "./ConvertableChatFeatureFormStore";
import {BlockUsersFeatureFormData} from "../types";
import {FormErrors} from "../../utils/types";
import {EntitiesStoreV2} from "../../entities-store";
import {ChatFeatures} from "../../api/types/response";

const INITIAL_FORM_VALUES: BlockUsersFeatureFormData = {
    enabled: false,
    allowPermanent: false
};
const INITIAL_FORM_ERRORS: FormErrors<BlockUsersFeatureFormData> = {
    enabled: undefined,
    allowPermanent: undefined
};

export class BlockUsersFeatureFormStore extends AbstractChatFeatureFormStore<BlockUsersFeatureFormData> implements ConvertableChatFeatureFormStore<"blockUsers"> {
    constructor(private readonly entities: EntitiesStoreV2, initialValues: BlockUsersFeatureFormData = INITIAL_FORM_VALUES) {
        super(initialValues, INITIAL_FORM_ERRORS);
    }

    @action
    populateFromRole = (roleId: string): void => {
        const role = this.entities.chatRoles.findByIdOptional(roleId);

        if (!role) {
            return;
        }

        this.setForm({
            enabled: role.features.blockUsers.enabled,
            allowPermanent: role.features.blockUsers.additional.allowPermanent
        });
    }

    convertToApiRequest(): ChatFeatures["blockUsers"] {
        return {
            enabled: this.formValues.enabled,
            additional: {
                allowPermanent: this.formValues.allowPermanent
            }
        };
    }
}