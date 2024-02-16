import {makeAutoObservable, reaction} from "mobx";
import {computedFn} from "mobx-utils";
import {ChatStore} from "../../Chat";

export class MessagesListScrollPositionsStore {
    scrollPositionsMap: {[chatId: string]: number} = {};

    reachedBottomMap: {[chatId: string]: boolean} = {};

    constructor(private readonly chatStore: ChatStore) {
        makeAutoObservable(this);

        reaction(
            () => this.chatStore.selectedChatId,
            selectedChatId => {
                if (selectedChatId) {
                    if (this.getReachedBottom(selectedChatId) === undefined) {
                        this.setReachedBottom(selectedChatId, true);
                    } else {
                        this.setReachedBottom(selectedChatId, false);
                    }
                }
            }
        )
    }


    setScrollPosition = (chatId: string, scrollPosition: number): void => {
        this.scrollPositionsMap[chatId] = scrollPosition;
    };

    setReachedBottom = (chatId: string, reachedBottom: boolean): void => {
        this.reachedBottomMap[chatId] = reachedBottom;
    };

    getScrollPosition = computedFn((chatId: string) => this.scrollPositionsMap[chatId]);

    getReachedBottom = computedFn((chatId: string) => this.reachedBottomMap[chatId]);
}
