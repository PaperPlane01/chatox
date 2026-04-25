import {FetchingState} from "../../utils/types";

interface ChatMessagesFetchingState extends FetchingState {

}

export interface ChatMessagesFetchingStateMap {
    [chatId: string]: FetchingState
}
