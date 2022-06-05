export enum VirtualScrollElement {
    MESSAGES_LIST = "MESSAGES_LIST",
    WINDOW = "WINDOW"
}

export const parseVirtualScrollElementFromString = (stringValue: string | null | undefined): VirtualScrollElement => {
    if (!stringValue) {
        return VirtualScrollElement.MESSAGES_LIST;
    }

    switch (stringValue.trim().toUpperCase()) {
        case "MESSAGES_LIST":
        default:
            return VirtualScrollElement.MESSAGES_LIST;
        case "WINDOW":
            return VirtualScrollElement.WINDOW
    }
}
