import {keys, makeAutoObservable, observable, ObservableMap} from "mobx";
import {computedFn} from "mobx-utils";
import {EntitiesStore} from "../../entities-store";
import {AuthorizationStore} from "../../Authorization";
import {CurrentUser} from "../../api/types/response";
import {UserStartedTyping} from "../../api/types/websocket";
import {differenceInSeconds} from "date-fns";

export class TypingUsersStore {
    typingUsers: ObservableMap<string, ObservableMap<string, Date>> = observable.map();

    get currentUser(): CurrentUser | undefined {
        return this.authorization.currentUser;
    }

    constructor(private readonly entities: EntitiesStore, private readonly authorization: AuthorizationStore) {
        makeAutoObservable(this);
    }

    hasTypingUsers = computedFn((chatId: string): boolean => {
        return this.getTypingUsersIds(chatId).length !== 0;
    })

    getTypingUsersIds = computedFn((chatId: string): readonly string[] => {
        if (this.typingUsers.get(chatId)) {
            return keys(this.typingUsers.get(chatId)!) as string[];
        } else {
            return [];
        }
    })

    onUserStartedTyping = (userStartedTyping: UserStartedTyping): void => {
        if (!this.entities.chats.findByIdOptional(userStartedTyping.chatId)) {
            return;
        }

        if (userStartedTyping.user.id === this.currentUser?.id) {
            return;
        }

        const {
            chatId,
            user
        } = userStartedTyping;

        this.entities.users.insert(userStartedTyping.user, {
            retrieveOnlineStatusFromExistingUser: true
        });

        let entry: ObservableMap<string, Date>;

        if (this.typingUsers.has(userStartedTyping.chatId)) {
            entry = this.typingUsers.get(userStartedTyping.chatId)!;
        } else {
            entry = observable.map();
        }

        entry.set(user.id, new Date());
        this.typingUsers.set(chatId, entry);

        const userId = user.id;

        setTimeout(() => this.removeTypingUser(chatId, userId), 3000);
    }

    removeTypingUser = (chatId: string, userId: string, force: boolean = false): void => {
        if (!this.typingUsers.has(chatId)) {
            return;
        }

        if (!this.typingUsers.get(chatId)!.has(userId)) {
            return;
        }

        const lastDate = this.typingUsers.get(chatId)!.get(userId)!;

        if (differenceInSeconds(new Date(), lastDate) < 3 && !force) {
            return;
        }

        this.typingUsers.get(chatId)?.delete(userId);
    }
}