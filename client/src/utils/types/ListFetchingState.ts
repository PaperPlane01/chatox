import {FetchingState} from "./FetchingState";

export interface ListFetchingState extends FetchingState {
    noMoreItems: boolean
}
