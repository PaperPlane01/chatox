import {PaginationState} from "./PaginationState";
import {SortingDirection} from "./SortingDirection";

export interface PaginationWithSortingState<SortByType = string, SortingDirectionType = SortingDirection> extends PaginationState {
    sortBy: SortByType,
    sortingDirection: SortingDirectionType
}
