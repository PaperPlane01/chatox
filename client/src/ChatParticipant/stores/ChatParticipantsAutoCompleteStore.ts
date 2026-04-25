import {makeAutoObservable, runInAction} from "mobx";
import {debounce, uniq} from "lodash";
import {ApiError, ChatApi, ChatParticipantApi, getInitialApiErrorFromResponse} from "../../api";
import {ChatParticipation, TimeUnit} from "../../api/types/response";
import {EntitiesStore} from "../../entities-store";
import {ExpirableStore} from "../../expirable-store";
import {Duration} from "../../utils/date-utils";
import {isStringEmpty} from "../../utils/string-utils";

export class ChatParticipantsAutoCompleteStore {
	loadedChatParticipants = new ExpirableStore<string, string[]>(Duration.of(
		30,
		TimeUnit.MINUTES
	));

	pending = false;

	error?: ApiError = undefined;

	constructor(private readonly entities: EntitiesStore) {
		makeAutoObservable(this);

		this.searchChatParticipants = debounce(this.searchChatParticipants, 300);
	}

	getLoadedChatParticipants = (chatId: string) => this.loadedChatParticipants.get(chatId) ?? [];

	fetchChatParticipants = (chatId: string, query: string): void => {
		const chat = this.entities.chats.findByIdOptional(chatId);
		const loadedChatParticipants = this.getLoadedChatParticipants(chatId);

		if (loadedChatParticipants.length === chat?.participantsCount) {
			return;
		}

		this.pending = true;
		this.error = undefined;

		if (isStringEmpty(query, true)) {
			this.fetchAllChatParticipants(chatId);
		} else {
			this.searchChatParticipants(chatId, query);
		}
	}

	private fetchAllChatParticipants = (chatId: string): void => {
		ChatApi
			.getChatParticipants(chatId, 0)
			.then(({data}) => runInAction(() => this.insertChatParticipants(chatId, data)))
			.catch(error => runInAction(() => this.error = getInitialApiErrorFromResponse(error)))
			.finally(() => runInAction(() => this.pending = false));
	}

	private searchChatParticipants = (chatId: string, query: string): void => {
		ChatParticipantApi
			.searchChatParticipants(chatId, query, {page: 0, pageSize: 150})
			.then(({data}) => runInAction(() => this.insertChatParticipants(chatId, data)))
			.catch(error => runInAction(() => this.error = getInitialApiErrorFromResponse(error)))
			.finally(() => runInAction(() => this.pending = false));
	}

	private insertChatParticipants = (chatId: string, chatParticipants: ChatParticipation[]): void => {
		this.entities.chatParticipations.insertAll(
			chatParticipants,
			{increaseChatParticipantsCount: false}
		);
		const existingChatParticipants = this.getLoadedChatParticipants(chatId);
		const loadedChatParticipantsIds = chatParticipants.map(chatParticipant => chatParticipant.id);
		this.loadedChatParticipants.insert(
			chatId,
			uniq(existingChatParticipants.concat(...loadedChatParticipantsIds))
		);
	}
}