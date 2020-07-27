export type SortingDirection = "asc" | "desc";

export const getOppositeSortingDirection = (sortingDirection: SortingDirection): SortingDirection => {
    if (sortingDirection === "desc") {
        return "asc";
    } else {
        return "desc";
    }
};
