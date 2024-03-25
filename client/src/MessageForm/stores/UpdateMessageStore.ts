import {action, makeObservable, observable, reaction, runInAction} from "mobx";
import {AbstractMessageFormStore} from "./AbstractMessageFormStore";
import {UploadMessageAttachmentsStore} from "./UploadMessageAttachmentsStore";
import {UpdateMessageFormData} from "../types";
import {FormErrors} from "../../utils/types";
import {EntitiesStore} from "../../entities-store";
import {getInitialApiErrorFromResponse, MessageApi} from "../../api";
import {ChatStore} from "../../Chat";
import {createWithUndefinedValues} from "../../utils/object-utils";
import {UploadedFileContainer} from "../../utils/file-utils";

const INITIAL_FORM_VALUES: UpdateMessageFormData = {
    text: ""
};
const INITIAL_FORM_ERRORS: FormErrors<UpdateMessageFormData> = createWithUndefinedValues(INITIAL_FORM_VALUES);

export class UpdateMessageStore extends AbstractMessageFormStore<UpdateMessageFormData>{
    updatedMessageId?: string = undefined;

    constructor(chatStore: ChatStore,
                messageUploads: UploadMessageAttachmentsStore,
                entities: EntitiesStore) {
        super(INITIAL_FORM_VALUES, INITIAL_FORM_ERRORS, chatStore, messageUploads, entities);

        makeObservable<UpdateMessageStore>(this, {
            updatedMessageId: observable,
            setUpdatedMessageId: action,
            submitForm: action.bound
        });

        reaction(
            () => this.updatedMessageId,
            messageId => {
                if (!messageId) {
                   this.reset();
                } else {
                    const message = this.entities.messages.findById(messageId);
                    this.setFormValue("text", message.text);
                    const uploads = this.entities.uploads.findAllById(message.uploads);
                    const files = uploads.map(upload => new UploadedFileContainer(
                        undefined,
                        upload.type,
                        false,
                        upload.id,
                        upload
                    ));
                    this.messageUploads.setMessageAttachmentsFiles(files);
                }
            }
        );
    }

    setUpdatedMessageId = (messageId?: string): void => {
        this.updatedMessageId = messageId;
    }

    submitForm = (): void => {
        if (!this.selectedChatId || !this.updatedMessageId || !this.validateForm()) {
            return;
        }

        this.pending = true;
        this.error = undefined;

        MessageApi.updateMessage(
            this.selectedChatId,
            this.updatedMessageId,
            {
                text: this.formValues.text,
                uploadAttachments: this.attachmentsIds
            }
        )
            .then(({data}) => runInAction(() => {
                const message = this.entities.messages.insert(data);
                this.setResultMessage(message);
                this.updatedMessageId = undefined;
                this.reset();
            }))
            .catch(error => this.setError(getInitialApiErrorFromResponse(error)))
            .finally(() => this.setPending(false));
    };

    protected reset = (): void => {
        super.reset();
        this.setUpdatedMessageId(undefined);
    };
}
