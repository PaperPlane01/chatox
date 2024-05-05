import {makeAutoObservable, observable, ObservableMap} from "mobx";
import {computedFn} from "mobx-utils";
import {Entities} from "./types";

type EntityReferences = {
	[EntityName in Entities]: ObservableMap<string, number>
};

export class ReferencedEntitiesStore {
	entityReferences: EntityReferences = {
		chatBlockings: observable.map(),
		chatInvites: observable.map(),
		chatParticipations: observable.map(),
		chatRoles: observable.map(),
		chatUploads: observable.map(),
		chats: observable.map(),
		globalBans: observable.map(),
		messages: observable.map(),
		pendingChatParticipations: observable.map(),
		reportedChats: observable.map(),
		reportedMessageSenders: observable.map(),
		reportedMessages: observable.map(),
		reportedUsers: observable.map(),
		reports: observable.map(),
		rewards: observable.map(),
		scheduledMessages: observable.map(),
		stickerPacks: observable.map(),
		stickers: observable.map(),
		uploads: observable.map(),
		userInteractions: observable.map(),
		userProfilePhotos: observable.map(),
		userRewards: observable.map(),
		users: observable.map()
	};

	constructor() {
		makeAutoObservable(this);
	}

	increaseReferenceCount = (entityName: Entities, entityId: string): void => {
		const referencesCount = this.entityReferences[entityName].get(entityId) ?? 0;
		this.entityReferences[entityName].set(entityId, referencesCount + 1);
	}

	decreaseReferenceCount = (entityName: Entities, entityId: string): void => {
		const referenceCount = this.entityReferences[entityName].get(entityId) ?? 0;
		const resultCount = referenceCount === 0 ? 0 : referenceCount - 1;

		if (resultCount !== 0) {
			this.entityReferences[entityName].set(entityId, resultCount);
		} else {
			this.entityReferences[entityName].delete(entityId);
		}
	}

	isEntityReferenced = computedFn((entityName: Entities, entityId: string): boolean => {
		return (this.entityReferences[entityName].get(entityId) ?? 0) !== 0;
	})
}