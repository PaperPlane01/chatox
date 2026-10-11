import {makeAutoObservable, observable, runInAction} from "mobx";
import {computedFn} from "mobx-utils";
import type {ReactionsToMessagesStore} from "./ReactionsToMessagesStore";
import {createMessageEmojiKey} from "../utils";
import type {EntitiesStore} from "../../entities-store";
import {MessageReactionApi} from "../../api";
import type {SnackbarService} from "../../Snackbar/services";
import type {LocaleStore} from "../../localization";
import type {AuthorizationStore} from "../../Authorization/stores";

export class MessageReactionOperationsStore {
    pendingReactions = observable.set<string>();

    constructor(private readonly reactionsToMessages: ReactionsToMessagesStore,
                private readonly entities: EntitiesStore,
                private readonly language: LocaleStore,
                private readonly authorization: AuthorizationStore,
                private readonly snackbarService: SnackbarService) {
        makeAutoObservable(this, {}, {autoBind: true});
    }

    isPending = computedFn((messageId: string, emojiId: string): boolean =>
        this.pendingReactions.has(createMessageEmojiKey(messageId, emojiId)))

    createMessageReaction(messageId: string, emojiId: string): void {
        if (this.isPending(messageId, emojiId)) {
            return;
        }

        const message = this.entities.messages.findById(messageId);

        const reactedByCurrentUser = Object.keys(message.reactionsCount)
            .some(emojiId => message.reactionsCount[emojiId].reactedByCurrentUser);

        if (reactedByCurrentUser) {
            return;
        }

        const key = createMessageEmojiKey(messageId, emojiId);
        this.pendingReactions.add(key);
        const chatId = this.entities.messages.findById(messageId).chatId;

        MessageReactionApi.createMessageReaction(chatId, messageId, emojiId)
            .then(({data}) => this.reactionsToMessages.addReaction(data))
            .catch(() => this.snackbarService.error(
                this.language.getCurrentLanguageLabel("message.reaction.create.error")
            ))
            .finally(() => runInAction(() => this.pendingReactions.delete(key)))
    }

    deleteMessageReaction(messageId: string, emojiId: string): void {
        if (this.isPending(messageId, emojiId)) {
            return;
        }

        const userId = this.authorization.currentUser?.id;

        if (!userId) {
            return;
        }

        const message = this.entities.messages.findById(messageId);
        const id = message.reactionsCount[emojiId].currentUserReactionId;

        if (!id) {
            return;
        }

        const key = createMessageEmojiKey(messageId, emojiId);
        this.pendingReactions.add(key);
        const chatId = this.entities.messages.findById(messageId).chatId;

        MessageReactionApi.deleteMessageReaction(chatId, messageId, emojiId)
            .then(() => this.reactionsToMessages.onMessageReactionDeleted({
                id,
                messageId,
                emojiId,
                userId
            }))
            .catch(() =>  this.snackbarService.error(
                this.language.getCurrentLanguageLabel("message.reaction.delete.error")
            ))
            .finally(() => runInAction(() => this.pendingReactions.delete(key)))
    }
}