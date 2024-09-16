import {makeAutoObservable, runInAction} from "mobx";
import {computedFn} from "mobx-utils";
import {uniqBy} from "lodash";
import {MentionItem} from "../types";
import {EntitiesStore} from "../../entities-store";
import {ChatsOfCurrentUserStore, ChatStore} from "../../Chat";
import {getUserDisplayedName} from "../../User/utils/labels";
import {ChatParticipantApi} from "../../api";
import {ChatType} from "../../api/types/response";
import {debounceAsync} from "../../utils/debounce-async";
import {UserEntity} from "../../User";

export class MentionsStore {
	get selectedChatId(): string | undefined {
		return this.chat.selectedChatId;
	}

	get dialogChatsIds(): string[] {
		return this.chatsOfCurrentUser
			.chatsOfCurrentUser
			.filter(chat => chat.chatType === ChatType.DIALOG)
			.map(chat => chat.chatId);
	}

	get dialogUsersIds(): string[] {
		return this.entities
			.chats
			.findAllById(this.dialogChatsIds)
			.map(chat => chat.userId!);
	}

	constructor(private readonly entities: EntitiesStore,
				private readonly chat: ChatStore,
				private readonly chatsOfCurrentUser: ChatsOfCurrentUserStore) {
		makeAutoObservable(this);

		this.searchMentions = debounceAsync(this.searchMentions, 300);
	}

	searchMentions = async (query: string): Promise<MentionItem[]> => {
		if (query.length === 0) {
			return [];
		}

		const [dialogUsers, chatParticipants] = await Promise.all([
			this.searchDialogUsers(query),
			this.selectedChatId
				? this.searchChatParticipants(this.selectedChatId, query)
				: Promise.resolve([])
		]);

		const dialogMentions: MentionItem[] = dialogUsers.map(user => ({
			value: user.slug ? user.slug : getUserDisplayedName(user),
			fromDialog: true,
			fromCurrentChat: false,
			id: user.id,
			slug: user.slug ?? user.id,
			url: `/user/${user.slug ?? user.id}`,
			displayedText: user.slug ? user.slug : getUserDisplayedName(user)
		}));
		const chatUsers: MentionItem[] = chatParticipants.map(user => ({
			value: user.slug ? user.slug : getUserDisplayedName(user),
			fromDialog: false,
			fromCurrentChat: true,
			id: user.id,
			slug: user.slug ?? user.id,
			url: `/user/${user.slug ?? user.id}`,
			displayedText: user.slug ? user.slug : getUserDisplayedName(user)
		}));

		return uniqBy(
			[...chatUsers, ...dialogMentions],
			item => item.value
		);
	}

	private searchDialogUsers = computedFn((query: string): UserEntity[] => {
		return this.entities.users
			.findAllById(this.dialogUsersIds)
			.filter(user =>
				getUserDisplayedName(user).toLowerCase().startsWith(query.toLowerCase())
				|| Boolean(user.slug?.toLowerCase().startsWith(query.toLowerCase()))
			);
	})

	private searchChatParticipants = async (chatId: string, query: string): Promise<UserEntity[]> => {
		const {data} = await ChatParticipantApi.searchChatParticipants(
			chatId,
			query,
			{page: 0, pageSize: 50}
		);
		return runInAction(() => {
			this.entities.chatParticipations.insertAll(data, {
				increaseChatParticipantsCount: false
			});
			const usersIds = data.map(chatParticipant => chatParticipant.user.id);
			return this.entities.users.findAllById(usersIds);
		});
	}
}