import {makeAutoObservable, reaction} from "mobx";
import {ReactionsToMessagesStore} from "./ReactionsToMessagesStore";
import {isDefined} from "../../utils/object-utils";

export class MessageReactionsDialogStore {
    messageId?: string = undefined;

    emojiId?: string = undefined;

    constructor(private readonly reactionsToMessages: ReactionsToMessagesStore) {
        makeAutoObservable(this, {}, {autoBind: true});

        reaction(
            () => this.messageId,
            messageId => {
                if (isDefined(messageId)) {
                    this.reactionsToMessages.fetchReactions(
                        messageId,
                        this.emojiId,
                        {abortIfInitiallyFetched: true},
                    );
                }
            }
        );

        reaction(
            () => this.emojiId,
            emojiId => {
                if (isDefined(this.messageId)) {
                    this.reactionsToMessages.fetchReactions(
                        this.messageId,
                        emojiId,
                        {abortIfInitiallyFetched: true}
                    );
                }
            }
        );
    }

    openTo(messageId: string, emojiId?: string): void {
        this.messageId = messageId;
        this.emojiId = emojiId;
    }

    close(): void {
        this.messageId = undefined;
        this.emojiId = undefined;
    }
}
