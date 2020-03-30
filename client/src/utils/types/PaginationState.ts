import {ListFetchingState} from "./ListFetchingState";

export interface PaginationState extends ListFetchingState {
    page: number
}
