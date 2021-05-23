import {observable, action, reaction} from "mobx";
import {createTransformer} from "mobx-utils";
import {ChatStore} from "../../Chat";

export class MessagesListScrollPositionsStore {
    @observable
    scrollPositionsMap: {[chatId: string]: number} = {};

    @observable
    reachedBottomMap: {[chatId: string]: boolean} = {};

    constructor(private readonly chatStore: ChatStore) {
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


    @action
    setScrollPosition = (chatId: string, scrollPosition: number): void => {
        this.scrollPositionsMap[chatId] = scrollPosition;
    }

    @action
    setReachedBottom = (chatId: string, reachedBottom: boolean): void => {
        this.reachedBottomMap[chatId] = reachedBottom;
    }

    getScrollPosition = createTransformer((chatId: string) => this.scrollPositionsMap[chatId]);

    getReachedBottom = createTransformer((chatId: string) => this.reachedBottomMap[chatId]);
}
