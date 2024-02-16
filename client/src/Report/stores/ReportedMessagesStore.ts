import {mergeWith} from "lodash";
import {AbstractEntityStore} from "../../entity-store";
import {EntitiesPatch} from "../../entities-store";
import {MessageEntity} from "../../Message/types";
import {convertMessageToNormalizedForm} from "../../Message/utils";
import {Message} from "../../api/types/response";
import {mergeCustomizer} from "../../utils/object-utils";

export class ReportedMessagesStore extends AbstractEntityStore<"reportedMessages", MessageEntity, Message> {
    protected convertToNormalizedForm(denormalizedEntity: Message): MessageEntity {
        return convertMessageToNormalizedForm(denormalizedEntity);
    }

    createPatchForArray(denormalizedEntities: Message[], options: {} | undefined): EntitiesPatch {
        const patch = this.createEmptyEntitiesPatch("reportedMessages", "reportedMessageSenders");
        const patches: EntitiesPatch[] = [];

        denormalizedEntities.forEach(message => {
            const entity = this.convertToNormalizedForm(message);
            patches.push(this.entities.reportedMessageSenders.createPatch(message.sender));

            if (message.attachments.length !== 0) {
                patches.push(this.entities.uploads.createPatchForArray(message.attachments));
            }

            if (message.referredMessage) {
                patches.push(this.createPatch(message.referredMessage));
            }

            if (message.sticker) {
                patches.push(this.entities.stickers.createPatch(message.sticker));
            }

            if (message.forwardedBy) {
                patches.push(this.entities.reportedMessageSenders.createPatch(message.forwardedBy));
            }

            patch.entities.reportedMessages[message.id] = entity;
            patch.ids.reportedMessages.push(message.id);
        });

        return mergeWith(patch, ...patches, mergeCustomizer);
    }

}