export enum ReverseScrollDirectionOption {
    DO_NOT_REVERSE = "DO_NOT_REVERSE",
    REVERSE = "REVERSE",
    REVERSE_AND_TRY_TO_RESTORE = "REVERSE_AND_TRY_TO_RESTORE"
}

export const parseReverseScrollingDirectionOptionFromString = (stringValue: string | null | undefined): ReverseScrollDirectionOption => {
    if (!stringValue) {
        return ReverseScrollDirectionOption.DO_NOT_REVERSE;
    }

    switch (stringValue.trim().toUpperCase()) {
        case "DO_NOT_REVERSE":
            return ReverseScrollDirectionOption.DO_NOT_REVERSE;
        case "REVERSE":
            return ReverseScrollDirectionOption.REVERSE;
        case "REVERSE_AND_TRY_TO_RESTORE":
            return ReverseScrollDirectionOption.REVERSE_AND_TRY_TO_RESTORE;
        default:
            return ReverseScrollDirectionOption.DO_NOT_REVERSE;
    }
}
