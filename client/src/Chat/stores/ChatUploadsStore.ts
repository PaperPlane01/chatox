import {ChatUploadEntity} from "../types";
import {AbstractEntityStore} from "../../entity-store";
import {ChatUploadAttachment} from "../../api/types/response";

export class ChatUploadsStore extends AbstractEntityStore<ChatUploadEntity, ChatUploadAttachment> {
    protected convertToNormalizedForm(denormalizedEntity: ChatUploadAttachment): ChatUploadEntity {
        return {
            id: denormalizedEntity.id,
            uploadSenderId: denormalizedEntity.uploadSender.id,
            uploadedCreatorId: denormalizedEntity.uploadCreator ? denormalizedEntity.uploadCreator.id : undefined,
            createdAt: new Date(denormalizedEntity.createdAt),
            type: denormalizedEntity.upload.type,
            uploadId: denormalizedEntity.upload.id
        };
    }
}
