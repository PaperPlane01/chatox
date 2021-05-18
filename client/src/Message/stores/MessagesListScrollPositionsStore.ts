import {observable, action} from "mobx";
import {createTransformer} from "mobx-utils";

export class MessagesListScrollPositionsStore {
    @observable
    scrollPositionsMap: {[chatId: string]: number} = {};

    @observable
    reachedBottomMap: {[chatId: string]: boolean} = {};

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
