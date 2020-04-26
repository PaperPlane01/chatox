import {action} from "mobx";
import {createTransformer} from "mobx-utils";
import {ChatBlockingEntity} from "../types";
import {AbstractEntityStore} from "../../entity-store";
import {ChatBlocking} from "../../api/types/response";
import {UsersStore} from "../../User/stores";

interface FindByChatOptions {
    chatId: string,
    sortingProperty?: "blockedUntil" | "blockedBy" | "blockedUser",
    sortingDirection?: "asc" | "desc"
}

export class ChatBlockingsStore extends AbstractEntityStore<ChatBlockingEntity, ChatBlocking> {
    constructor(private readonly users: UsersStore) {
        super();
    }

    findByChat = createTransformer((options: FindByChatOptions) => {
        const {chatId, sortingProperty = "blockedUntil", sortingDirection = "desc"} = options;

        switch (sortingProperty) {
            case "blockedUntil":
                return this.ids.map(id => this.entities[id])
                    .filter(blocking => blocking.chatId === chatId)
                    .slice()
                    .sort((left, right) => {
                        if (sortingDirection === "desc") {
                            return right.blockedUntil.getTime() - left.blockedUntil.getTime();
                        } else {
                            return left.blockedUntil.getTime() - right.blockedUntil.getTime();
                        }
                    })
                    .map(blocking => blocking.id);
            case "blockedUser": {
                return this.ids.map(id => this.findById(id))
                    .filter(blocking => blocking.chatId === chatId)
                    .slice()
                    .sort((left, right) => {
                        const leftUser = this.users.findById(left.blockedUserId);
                        const rightUser = this.users.findById(right.blockedUserId);

                        if (sortingDirection === "desc") {
                            return rightUser.firstName.localeCompare(leftUser.firstName);
                        } else {
                            return leftUser.firstName.localeCompare(rightUser.firstName);
                        }
                    })
                    .map(blocking => blocking.id)
            }
            case "blockedBy":
            default:
                return this.ids.map(id => this.findById(id))
                    .filter(blocking => blocking.chatId === chatId)
                    .slice()
                    .sort((left, right) => {
                        const leftUser = this.users.findById(left.blockedById);
                        const rightUser = this.users.findById(right.blockedById);

                        if (sortingDirection === "desc") {
                            return rightUser.firstName.localeCompare(leftUser.firstName);
                        } else {
                            return leftUser.firstName.localeCompare(rightUser.firstName);
                        }
                    })
                    .map(blocking => blocking.id)
        }
    });

    @action
    deleteByChat = (chatId: string) => {
        const blockings = this.findByChat({chatId});
        this.deleteAllById(blockings);
    };

    protected convertToNormalizedForm(denormalizedEntity: ChatBlocking): ChatBlockingEntity {
        return {
            id: denormalizedEntity.id,
            blockedById: denormalizedEntity.blockedBy.id,
            blockedUntil: new Date(denormalizedEntity.blockedUntil),
            blockedUserId: denormalizedEntity.blockedUser.id,
            canceled: denormalizedEntity.canceled,
            canceledAt: denormalizedEntity.canceledAt ? new Date(denormalizedEntity.canceledAt) : undefined,
            canceledByUserId: denormalizedEntity.canceledBy && denormalizedEntity.canceledBy.id,
            chatId: denormalizedEntity.chatId,
            description: denormalizedEntity.description,
            lastModifiedAt: denormalizedEntity.lastModifiedAt ? new Date(denormalizedEntity.lastModifiedAt) : undefined,
            lastModifiedByUserId: denormalizedEntity.lastModifiedBy && denormalizedEntity.lastModifiedBy.id
        }
    }
}
