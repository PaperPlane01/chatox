import {action} from "mobx";
import {AbstractChatFeatureFormStore} from "./AbstractChatFeatureFormStore";
import {ConvertableChatFeatureFormStore} from "./ConvertableChatFeatureFormStore";
import {SendMessagesFeatureFormData} from "../types";
import {FormErrors} from "../../utils/types";
import {ChatFeatures} from "../../api/types/response";
import {EntitiesStoreV2} from "../../entities-store";

const INITIAL_FORM_VALUES: SendMessagesFeatureFormData = {
    enabled: false,
    allowedToSendAudios: false,
    allowedToSendFiles: false,
    allowedToSendImages: false,
    allowedToSendStickers: false,
    allowedToSendVideos: false,
    allowedToSendVoiceMessages: false
};
const INITIAL_FORM_ERRORS: FormErrors<SendMessagesFeatureFormData> = {
    enabled: undefined,
    allowedToSendAudios: undefined,
    allowedToSendFiles: undefined,
    allowedToSendImages: undefined,
    allowedToSendStickers: undefined,
    allowedToSendVideos: undefined,
    allowedToSendVoiceMessages: undefined
};

export class SendMessagesFeatureFormStore extends AbstractChatFeatureFormStore<SendMessagesFeatureFormData> implements ConvertableChatFeatureFormStore<"sendMessages"> {
    constructor(private entities: EntitiesStoreV2, initialValues: SendMessagesFeatureFormData = INITIAL_FORM_VALUES) {
        super(initialValues, INITIAL_FORM_ERRORS);
    }

    convertToApiRequest(): ChatFeatures["sendMessages"] {
        return {
            enabled: this.formValues.enabled,
            additional: {
                allowedToSendAudios: this.formValues.allowedToSendAudios,
                allowedToSendFiles: this.formValues.allowedToSendFiles,
                allowedToSendImages: this.formValues.allowedToSendImages,
                allowedToSendStickers: this.formValues.allowedToSendStickers,
                allowedToSendVideos: this.formValues.allowedToSendVideos,
                allowedToSendVoiceMessages: this.formValues.allowedToSendVoiceMessages
            }
        }
    }

    @action
    populateFromRole = (roleId: string): void => {
        const role = this.entities.chatRoles.findByIdOptional(roleId);

        if (role) {
            this.setForm({
                enabled: role.features.sendMessages.enabled,
                ...role.features.sendMessages.additional
            });
        }
    }
}